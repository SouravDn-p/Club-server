import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from 'src/common/types/commonAuthTypes';
import { SafeUser } from '../users/types/userTypes';

export type AuthResult = { user: SafeUser; tokens: { accessToken: string; refreshToken: string } };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async googleStrategyValidate(profile: any): Promise<AuthResult> {
    const { id: providerId, emails, name, photos } = profile;
    const email = emails[0].value;

    // Look up by providerId first (most reliable), fall back to email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'google', providerId },
          { email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: `${name.givenName} ${name.familyName}`,
          avatarUrl: photos[0]?.value ?? null,
          provider: 'google',
          providerId,
          isVerified: true,
        },
      });
    } else if (!user.providerId) {
      // Existing email-only account — link Google provider
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { provider: 'google', providerId, isVerified: true },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const { password, ...safeUser } = user;
    return { user: safeUser as SafeUser, tokens };
  }

  async register(dto: CreateUserDto): Promise<AuthResult> {
    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isBlocked) throw new UnauthorizedException('Account is blocked');
    if (user.isDeleted) throw new UnauthorizedException('Account has been deleted');

    // Social-only accounts have no password
    if (!user.password) {
      throw new UnauthorizedException(
        `This account uses ${user.provider ?? 'social'} login. Please sign in with that provider.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const { password, ...safeUser } = user;
    return { user: safeUser as SafeUser, tokens };
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await this.prisma.authToken.findFirst({
      where: { userId, refreshToken, expiresAt: { gt: new Date() } },
    });

    if (!storedToken) throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.usersService.findOne(userId);
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number): Promise<void> {
    try {
      await this.prisma.authToken.deleteMany({ where: { userId } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async me(userId: number): Promise<SafeUser> {
    return this.usersService.findOne(userId);
  }

  private async generateTokens(userId: number, email: string, role: any) {
    const payload: JwtPayload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    try {
      await this.prisma.authToken.create({
        data: { userId, accessToken: '', refreshToken, expiresAt },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException('Duplicate entry');
        case 'P2025':
          throw new UnauthorizedException('Record not found');
        case 'P2003':
          throw new ConflictException('Foreign key constraint failed');
        default:
          throw new InternalServerErrorException(`Database error: ${error.code}`);
      }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new InternalServerErrorException('Invalid data provided to database');
    }
    throw error;
  }
}
