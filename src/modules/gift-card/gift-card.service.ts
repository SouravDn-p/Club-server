import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';

@Injectable()
export class GiftCardService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async generateUniqueCode(): Promise<string> {
    const randomString = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const existing = await this.prisma.giftCard.findUnique({
      where: { code: randomString },
    });
    if (existing) return this.generateUniqueCode();
    return randomString;
  }

  // Get All Gift Card For Admin
  async getAll() {
    try {
      const giftCards = await this.prisma.giftCard.findMany();
      return ApiResponseHelper.success(
        giftCards,
        'Gift card list fetched successfully',
        200,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // ADMIN: Create Gift Card
  async create(dto: CreateGiftCardDto, file?: Express.Multer.File) {
    try {
      let imageUrl: string | undefined;

      if (file) {
        const upload = await this.cloudinary.uploadFile(file, 'gift-cards');
        imageUrl = upload.url;
      }

      return await this.prisma.giftCard.create({
        data: {
          code: dto.code,
          discountType: dto.discountType,
          discountValue: dto.discountValue,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
          image: imageUrl,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // User: CLAIM
  async claim(id: number, userId: number) {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { id },
    });

    if (!giftCard || !giftCard.isActive) {
      throw new BadRequestException('Invalid gift card');
    }

    const alreadyClaimed = await this.prisma.giftCardUsage.findUnique({
      where: {
        userId_giftCardId: {
          userId,
          giftCardId: giftCard.id,
        },
      },
    });

    if (alreadyClaimed) {
      throw new BadRequestException('Already claimed');
    }

    await this.prisma.giftCardUsage.create({
      data: {
        userId,
        giftCardId: giftCard.id,
      },
    });

    return { message: 'Gift card claimed successfully' };
  }

  // APPLY DURING SUBSCRIPTION
  async apply(id: number, planId: number, userId: number) {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { id },
    });

    if (!giftCard) throw new BadRequestException('Invalid card');

    const usage = await this.prisma.giftCardUsage.findUnique({
      where: {
        userId_giftCardId: {
          userId,
          giftCardId: giftCard.id,
        },
      },
    });

    if (!usage) {
      throw new BadRequestException('Claim the gift card first');
    }

    if (usage.usedAt) {
      throw new BadRequestException('Already used');
    }

    // get plan
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new BadRequestException('Invalid plan');

    let finalPrice = plan.price;

    if (giftCard.discountType === 'PERCENTAGE') {
      finalPrice = plan.price - (plan.price * giftCard.discountValue) / 100;
    } else {
      finalPrice = plan.price - giftCard.discountValue;
    }

    if (finalPrice < 0) finalPrice = 0;

    // mark as used
    await this.prisma.giftCardUsage.update({
      where: { id: usage.id },
      data: { usedAt: new Date() },
    });

    return {
      originalPrice: plan.price,
      finalPrice,
      credits: plan.credits,
      message: 'Gift card applied',
    };
  }
}
