import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      include: {
        features: true,
      },
    });
  }

  async createPlan(dto) {
    return this.prisma.subscriptionPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        credits: dto.credits,
        features: {
          create: dto.features.map((f) => ({ text: f })),
        },
      },
    });
  }

  async purchase(planId: number, userId: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new BadRequestException('Plan not found');

    // add credits to user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: plan.credits,
        },
      },
    });

    return {
      message: 'Subscription purchased',
      creditsAdded: plan.credits,
    };
  }
}