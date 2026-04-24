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
import { ApiResponseHelper } from 'src/common/utils/api-response.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async googleStrategyValidate(profile: any) {
    const { emails, name, photos } = profile;
    const email = emails[0].value;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: `${name.givenName} ${name.familyName}`,
          avatarUrl: photos[0].value,
          provider: 'google',
          isVerified: true,
          role: 'USER',
          // password intentionally omitted — social login
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const { password, ...safeUser } = user;
    return { user: safeUser as SafeUser, tokens };
  }

  async register(dto: CreateUserDto): Promise<{ user: SafeUser; tokens: { accessToken: string; refreshToken: string } }> {
    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return ApiResponseHelper.success({ user, tokens } ,"User Created Successfully" , 200);
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; tokens: { accessToken: string; refreshToken: string } }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const isPasswordValid = user.password
      ? await bcrypt.compare(dto.password, user.password)
      : false;
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const { password, ...safeUser } = user;
    return { user: safeUser as SafeUser, tokens };
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await this.prisma.authToken.findFirst({
      where: {
        userId,
        refreshToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

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

  async me(userId: number){
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { ...safeUser } = user;
    return safeUser as SafeUser;
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
        data: {
          userId,
          accessToken: '',
          refreshToken,
          expiresAt,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException('Token already exists');
        case 'P2025':
          throw new UnauthorizedException('Token not found');
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
