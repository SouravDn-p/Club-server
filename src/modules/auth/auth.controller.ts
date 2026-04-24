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
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RefreshAuthGuard } from 'src/common/guards/refresh.auth.guard';
import { GoogleAuthGuard } from 'src/common/guards/google.auth.guard';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { setAuthCookies, clearAuthCookies } from 'src/common/utils/cookie.util';
import type { SafeUser } from '../users/types/userTypes';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto);
    setAuthCookies(res, tokens);
    return { user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto);
    setAuthCookies(res, tokens);
    return { user };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: JwtUser & { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(user.userId, user.refreshToken);
    setAuthCookies(res, tokens);
    return { message: 'Tokens refreshed' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.userId);
    clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  // ── Google OAuth ──────────────────────────────────────────────

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {
    // Passport redirects to Google — no body needed
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { user, tokens } = req.user as { user: SafeUser; tokens: { accessToken: string; refreshToken: string } };
    setAuthCookies(res, tokens);
    // Redirect to frontend after successful login
    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  }
}
