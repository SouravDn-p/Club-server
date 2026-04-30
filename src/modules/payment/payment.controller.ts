import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { ApiTags } from '@nestjs/swagger';
import type { JwtUser } from 'src/common/types/commonAuthTypes';

@Controller('payments')
@ApiTags('payments')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto.planId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  confirm(@Body() dto: ConfirmPaymentDto, @CurrentUser() user: JwtUser) {
    return this.service.confirm(dto.paymentId, user.userId);
  }
}
