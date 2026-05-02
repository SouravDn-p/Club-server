import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';
import { JwtUser } from 'src/common/types/commonAuthTypes';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly safeSelect = {
    id: true,
    userId: true,
    name: true,
    email: true,
    location: true,
    rating: true,
    review: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        location: true,
      },
    },
  } satisfies Prisma.ReviewSelect;

  async getReviewAnalytics() {
    const [totalReviews, avgRating, ratingsGroup] =
      await this.prisma.$transaction([
        this.prisma.review.count(),
        this.prisma.review.aggregate({
          _avg: { rating: true },
        }),
        this.prisma.review.groupBy({
          by: ['rating'],
          _count: { rating: true },
          orderBy: { rating: 'asc' },
        }),
      ]);

    const breakdown: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingsGroup.forEach((item) => {
      const rating = item.rating;
      const count = (item._count as unknown as { rating: number }).rating;
      breakdown[rating] = count || 0;
    });

    return {
      totalReviews,
      averageRating: Number(avgRating._avg.rating?.toFixed(2)) || 0,
      ratingBreakdown: breakdown,
    };
  }

  async findAllReviews(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.safeSelect,
      }),
      this.prisma.review.count(),
    ]);

    const paginatedReviews = {
      data: reviews,
      paginationMeta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return paginatedReviews;
  }

  async findOne(id: number) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
        select: this.safeSelect,
      });
      if (!review) throw new NotFoundException('Review not found');
      return review;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // ------------------------
  // CREATE REVIEW
  // ------------------------

  async createReview(data: CreateReviewDto, user: JwtUser) {
    console.log(user);
    try {
      const findUser = await this.prisma.user.findUnique({
        where: { id: user.userId },
      });
      if (!findUser) throw new NotFoundException('User not found');
      const review = await this.prisma.review.create({
        data: { ...data, userId: findUser.id, email: findUser.email },
        select: this.safeSelect,
      });
      return review;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: number, dto: UpdateReviewDto) {
    await this.findOne(id);

    try {
      return await this.prisma.review.update({
        where: { id },
        data: dto,
        select: this.safeSelect,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.review.delete({
        where: { id },
        select: this.safeSelect,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
