import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { ApiTags } from '@nestjs/swagger';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';
import { Role } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@Controller('payments')
@ApiTags('payments')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Role(UserRole.ADMIN)
  @Get('')
  async findAll(@Query() paginationDto : PaginationDto){
    const payments = await this.service.getAllPayments(paginationDto)
    return ApiResponseHelper.success(payments, "Payments fetched Successfully" , 201)
  }

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
