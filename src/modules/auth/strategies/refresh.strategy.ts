import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  sessionId: string;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies?.refreshToken as string) ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    };
    super(options);
  }

  validate(req: Request, payload: JwtPayload) {
    const cookies: Record<string, string | undefined> = req.cookies;
    const refreshToken: string | undefined = cookies?.refreshToken;

    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    return {
      userId: Number(payload.sub),
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      refreshToken: refreshToken,
    };
  }
}
