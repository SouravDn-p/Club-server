import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './services/prisma/prisma.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PostsModule } from './modules/posts/posts.module';
import { FilmNotesModule } from './modules/film-notes/film-notes.module';
import { GiftCardModule } from './modules/gift-card/gift-card.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import cloudinaryConfig from './config/cloudinary.config';
import databaseConfig from './config/database.config';
import googleOauthConfig from './config/google-oauth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`, `.env.${process.env.NODE_ENV || 'development'}`],
      load: [
        appConfig,
        jwtConfig,
        cloudinaryConfig,
        databaseConfig,
        googleOauthConfig,
      ],
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    ReviewsModule,
    PostsModule,
    FilmNotesModule,
    GiftCardModule,
    SubscriptionModule,
    PaymentModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
