import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from 'src/services/prisma/prisma.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy, GoogleStrategy],
})
export class AuthModule {}
