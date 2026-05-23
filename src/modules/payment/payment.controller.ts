import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';
import { Role } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Role(UserRole.ADMIN)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const payments = await this.service.getAllPayments(paginationDto);
    return ApiResponseHelper.success(payments, 'Payments fetched successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtUser,
  ) {
    const result = await this.service.createCheckoutSession(
      user.userId,
      dto.planId,
    );
    return ApiResponseHelper.success(result, 'Checkout session created', 201);
  }

  @Get('status')
  async getPaymentStatus(@Query('sessionId') sessionId: string) {
    const status = await this.service.getPaymentStatus(sessionId);
    return ApiResponseHelper.success(status, 'Payment status retrieved');
  }

  // Webhook - NO JWT, raw body
  @Post('webhook')
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.service.handleWebhook(req.body, signature);
  }
}