import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('subscriptions')
@ApiTags('subscriptions')
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Get()
  getPlans() {
    return this.service.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  purchase(@Body('planId') planId: number, @CurrentUser() user: any) {
    return this.service.purchase(planId, user.userId);
  }

  // ADMIN
  @Post()
  createPlan(@Body() dto: CreatePlanDto) {
    return this.service.createPlan(dto);
  }
}