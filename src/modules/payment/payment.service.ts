import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // 🔹 CREATE PAYMENT
  async create(planId: number, userId: number) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      const payment = await this.prisma.payment.create({
        data: {
          userId,
          planId,
          amount: plan.price,
          status: 'PENDING',
        },
      });

      return {
        message: 'Payment created',
        paymentId: payment.id,
        amount: plan.price,
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // 🔹 CONFIRM PAYMENT
  async confirm(paymentId: number, userId: number) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { plan: true },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.userId !== userId) {
        throw new BadRequestException('Unauthorized access');
      }

      if (payment.status === 'SUCCESS') {
        throw new BadRequestException('Payment already completed');
      }

      // 🔐 Transaction safe update
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: 'SUCCESS' },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: payment.plan.credits,
            },
          },
        });
      });

      return {
        message: 'Payment successful',
        creditsAdded: payment.plan.credits,
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }
}