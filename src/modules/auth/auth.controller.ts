import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RefreshAuthGuard } from 'src/common/guards/refresh.auth.guard';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import type { SafeUser } from '../users/types/userTypes';
import { setAuthCookies, clearAuthCookies } from 'src/common/utils/cookie.util';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account' })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto);
    setAuthCookies(res, tokens);
    return ApiResponseHelper.success(user, 'Account created successfully', HttpStatus.CREATED);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const { user, tokens } = await this.authService.login(dto, userAgent);
    setAuthCookies(res, tokens);
    return ApiResponseHelper.success(user, 'Logged in successfully');
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  async refresh(
    @CurrentUser() user: JwtUser & { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(
      user.userId,
      user.sessionId,
      user.refreshToken,
    );
    setAuthCookies(res, tokens);
    return ApiResponseHelper.success(null, 'Tokens refreshed successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@CurrentUser() user: JwtUser) {
    const data = await this.authService.me(user.userId);
    return ApiResponseHelper.success(data, 'User profile fetched');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from current device (deletes this session)' })
  async logout(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sessionId);
    clearAuthCookies(res);
    return ApiResponseHelper.success(null, 'Logged out successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices (deletes all sessions)' })
  async logoutAll(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.userId);
    clearAuthCookies(res);
    return ApiResponseHelper.success(null, 'Logged out from all devices');
  }

  // ── Google OAuth ──────────────────────────────────────────────

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { tokens } = req.user as { user: SafeUser; tokens: { accessToken: string; refreshToken: string } };
    setAuthCookies(res, tokens);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  }
}
