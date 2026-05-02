import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from 'src/common/types/commonAuthTypes';
import { SafeUser } from '../users/types/userTypes';

export type Tokens = { accessToken: string; refreshToken: string };
export type AuthResult = { user: SafeUser; tokens: Tokens };

const MAX_SESSIONS = 6;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Google OAuth ──────────────────────────────────────────────────────────

  async googleStrategyValidate(profile: {
    id: string;
    emails?: { value: string }[];
    name?: { givenName: string; familyName: string };
    photos?: { value: string }[];
  }): Promise<AuthResult> {
    const { id: providerId, emails, name, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Email not provided by Google');
    }


    let user = await this.prisma.user.findFirst({
      where: { OR: [{ provider: 'google', providerId }, { email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: name ? `${name.givenName} ${name.familyName}` : 'Google User',
          avatarUrl: photos?.[0]?.value ?? null,

          provider: 'google',
          providerId,
          isVerified: true,
        },
      });
    } else if (!user.providerId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { provider: 'google', providerId, isVerified: true },
      });
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }
    if (user.isDeleted) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const sessionId = uuidv4();
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      sessionId,
    );
    await this.storeSession(user.id, sessionId, tokens.refreshToken);

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      isBlocked: user.isBlocked,
      role: user.role,
      credits: user.credits,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: safeUser, tokens };
  }

  // ── Register ──────────────────────────────────────────────────────────────

  async register(dto: CreateUserDto): Promise<AuthResult> {
    const user = await this.usersService.create(dto);
    const sessionId = uuidv4();
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      sessionId,
    );
    await this.storeSession(user.id, sessionId, tokens.refreshToken);
    return { user, tokens };
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, userAgent?: string): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isBlocked) throw new UnauthorizedException('Account is blocked');
    if (user.isDeleted)
      throw new UnauthorizedException('Account has been deleted');

    if (!user.password) {
      throw new UnauthorizedException(
        `This account uses ${user.provider ?? 'social'} login. Please sign in with that provider.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const sessionId = uuidv4();
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      sessionId,
    );
    await this.storeSession(user.id, sessionId, tokens.refreshToken, userAgent);

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      isBlocked: user.isBlocked,
      role: user.role,
      credits: user.credits,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: safeUser, tokens };
  }

  // ── Refresh ───────────────────────────────────────────────────────────────

  async refreshTokens(
    userId: number,
    sessionId: string,
    rawRefreshToken: string,
  ): Promise<Tokens> {
    // Guard against legacy tokens that predate sessionId
    if (!sessionId || !rawRefreshToken) {
      throw new UnauthorizedException('Session expired — please log in again');
    }

    const session = await this.prisma.authToken.findUnique({
      where: { sessionId },
    });

    if (
      !session ||
      session.userId !== userId ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const isValid = await bcrypt.compare(rawRefreshToken, session.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findOne(userId);
    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }
    const newTokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      sessionId,
    );

    // Update only this session's token
    const hashedRefresh = await bcrypt.hash(newTokens.refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.authToken.update({
      where: { sessionId },
      data: { refreshToken: hashedRefresh, expiresAt },
    });

    return newTokens;
  }

  // ── Logout (current session) ──────────────────────────────────────────────

  async logout(sessionId: string): Promise<void> {
    if (!sessionId) return; // nothing to delete for legacy tokens
    try {
      await this.prisma.authToken.deleteMany({ where: { sessionId } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // ── Logout all devices ────────────────────────────────────────────────────

  async logoutAll(userId: number): Promise<void> {
    try {
      await this.prisma.authToken.deleteMany({ where: { userId } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // ── Me ────────────────────────────────────────────────────────────────────

  async me(userId: number): Promise<SafeUser> {
    return this.usersService.findOne(userId);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async generateTokens(
    userId: number,
    email: string,
    role: UserRole,
    sessionId: string,
  ): Promise<Tokens> {
    const payload: JwtPayload = { sub: userId, email, role, sessionId };
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

  private async storeSession(
    userId: number,
    sessionId: string,
    rawRefreshToken: string,
    userAgent?: string,
  ): Promise<void> {
    // Enforce max session limit — evict oldest if at cap
    const sessionCount = await this.prisma.authToken.count({
      where: { userId },
    });
    if (sessionCount >= MAX_SESSIONS) {
      const oldest = await this.prisma.authToken.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest)
        await this.prisma.authToken.delete({ where: { id: oldest.id } });
    }

    const hashedRefresh = await bcrypt.hash(rawRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      await this.prisma.authToken.create({
        data: {
          userId,
          sessionId,
          refreshToken: hashedRefresh,
          userAgent,
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
          throw new ConflictException('Duplicate session');
        case 'P2025':
          throw new UnauthorizedException('Session not found');
        case 'P2003':
          throw new ConflictException('Foreign key constraint failed');
        default:
          throw new InternalServerErrorException(
            `Database error: ${error.code}`,
          );
      }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new InternalServerErrorException(
        'Invalid data provided to database',
      );
    }
    throw error;
  }
}
