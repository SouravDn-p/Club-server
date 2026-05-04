import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SubscriptionService } from './subscription.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PurchasePlanDto } from './dto/purchase-plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { imageMulterOptions } from 'src/config/multer.config';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  async getPlans() {
    const plans = await this.service.getPlans();
    return ApiResponseHelper.success(plans, "Plans Recived Successfully", 200 );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single subscription plan' })
  getPlan(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPlan(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a subscription plan (admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', imageMulterOptions))
  createPlan(
    @Body() dto: CreatePlanDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.service.createPlan(dto, image);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription plan (admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', imageMulterOptions))
  updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.service.updatePlan(id, dto, image);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription plan (admin only)' })
  deletePlan(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePlan(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Purchase a plan — credits added to your account' })
  purchase(@Body() dto: PurchasePlanDto, @CurrentUser() user: JwtUser) {
    return this.service.purchase(dto.planId, user.userId);
  }
}
