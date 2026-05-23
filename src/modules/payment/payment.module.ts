import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from 'src/services/prisma/prisma.module';
import stripeConfig from 'src/config/stripe.config';

@Module({
  imports: [PrismaModule, ConfigModule.forFeature(stripeConfig)],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}