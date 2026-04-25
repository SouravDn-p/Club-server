import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getPlans() {
    try {
      return await this.prisma.subscriptionPlan.findMany({
        include: { features: true },
        orderBy: { price: 'asc' },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getPlan(id: number) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
        include: { features: true },
      });
      if (!plan) throw new NotFoundException(`Plan #${id} not found`);
      return plan;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async createPlan(dto: CreatePlanDto, imageFile?: Express.Multer.File) {
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const upload = await this.cloudinary.uploadFile(imageFile, 'subscriptions', 'image');
        imageUrl = upload.url;
      }

      return await this.prisma.subscriptionPlan.create({
        data: {
          title: dto.title,
          description: dto.description,
          price: dto.price,
          credits: dto.credits,
          image: imageUrl,
          features: {
            create: dto.features.map((text) => ({ text })),
          },
        },
        include: { features: true },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updatePlan(id: number, dto: UpdatePlanDto, imageFile?: Express.Multer.File) {
    try {
      await this.getPlan(id);

      const { features, image, ...rest } = dto as any;

      let imageUrl: string | undefined;
      if (imageFile) {
        const upload = await this.cloudinary.uploadFile(imageFile, 'subscriptions', 'image');
        imageUrl = upload.url;
      }

      return await this.prisma.subscriptionPlan.update({
        where: { id },
        data: {
          ...rest,
          ...(imageUrl ? { image: imageUrl } : {}),
          ...(Array.isArray(features) && features.length > 0
            ? {
                features: {
                  deleteMany: {},
                  create: features.map((text: string) => ({ text })),
                },
              }
            : {}),
        },
        include: { features: true },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deletePlan(id: number) {
    try {
      await this.getPlan(id);
      return await this.prisma.subscriptionPlan.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async purchase(planId: number, userId: number) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) throw new NotFoundException('Plan not found');

      await this.prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: plan.credits } },
      });

      return { message: 'Subscription purchased', creditsAdded: plan.credits };
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
