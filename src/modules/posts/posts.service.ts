import { BadRequestException, Body, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';

@Injectable()
export class PostsService {
    constructor(
        private readonly prisma :PrismaService,
         private readonly cloudinary : CloudinaryService
    ){}

    private safeSelect = {
    id: true,
    title: true,
    content: true,
    description: true,
    image: true,
    views: true,
    createdAt: true,
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    _count: {
      select: {
        comments: true,
        likes: true,
      },
    },
  };



    // Get ALl Posts
    async GetPosts (query: GetPostsQueryDto){
    const { page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.PostWhereInput = search
    ? {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }
    : {};

  const [posts, total] = await this.prisma.$transaction([
    this.prisma.post.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: [
        // newest first but can be improved later
        { createdAt: 'desc' },
      ],
      select: this.safeSelect,
    }),

    this.prisma.post.count({
      where: whereCondition,
    }),
  ]);

  return {
    data: posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
    }

    // GET SINGLE POST + INCREMENT VIEWS
    async findOne(id: number) {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
      select: {
        ...this.safeSelect,
        comments: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return post;
    }

    // Create Post
    async create(
        @Body() data : CreatePostDto ,
        file: Express.Multer.File,
        userId: number,
    ){
     try {
      let imageUrl: string | undefined;
      if (!file) {
        throw new BadRequestException('Image is required');
      }

      if (file) {
        const upload = await this.cloudinary.uploadFile(file, 'posts');
        imageUrl = upload.url;
      }

      return await this.prisma.post.create({
        data: {
          ...data,
          image: imageUrl,
          authorId: userId,
        },
        select: this.safeSelect,
      });
    } catch (error) {
      handlePrismaError(error);
    }
    }

     // UPDATE
  async update(id: number, dto: UpdatePostDto) {
    try {
      return await this.prisma.post.update({
        where: { id },
        data: dto,
        select: this.safeSelect,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // DELETE
  async remove(id: number) {
    try {
      return await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // ADD COMMENT
  async addComment(dto: CreateCommentDto, userId: number) {
    try {
      return await this.prisma.postComment.create({
        data: {
          postId: dto.postId,
          comment: dto.comment,
          userId,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // TOGGLE LIKE
  async toggleLike(postId: number, userId: number) {
    const existing = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    try {
      if (existing) {
        await this.prisma.postLike.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        });

        return { liked: false };
      } else {
        await this.prisma.postLike.create({
          data: { postId, userId },
        });

        return { liked: true };
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
    

