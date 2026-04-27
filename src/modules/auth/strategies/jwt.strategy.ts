import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload, JwtUser } from 'src/common/types/commonAuthTypes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => req?.cookies?.accessToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    };
    super(options);
  }

  validate(payload: JwtPayload): JwtUser {
    return {
      userId: Number(payload.sub),
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
