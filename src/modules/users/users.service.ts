import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { SafeUser } from './types/userTypes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Fields returned for all user queries (excludes password)
  private readonly safeSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    avatarUrl: true,
    provider: true,
    isVerified: true,
    isDeleted: true,
    isBlocked: true,
    role: true,
    credits: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: { isDeleted: false },
        select: this.safeSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { isDeleted: false } }),
    ]);

    return {
      data: users as SafeUser[],
      paginationMeta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.safeSelect,
    });

    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  // Used internally by auth — returns full user including password
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          password: hashedPassword,
          role: dto.role,
        },
        select: this.safeSelect,
      });
      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<SafeUser> {
    await this.findOne(id);

    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: this.safeSelect,
      });
      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number): Promise<SafeUser> {
    await this.findOne(id);

    try {
      const user = await this.prisma.user.delete({
        where: { id },
        select: this.safeSelect,
      });
      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<SafeUser> {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: this.safeSelect,
    });
    return user;
  }

  // Centralised Prisma error handler
  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const fields = (error.meta?.target as string[]) ?? [];
          const field = fields[0] ?? 'field';
          throw new ConflictException(`${field} already in use`);
        }
        case 'P2025':
          throw new NotFoundException('Record not found');
        case 'P2003':
          throw new ConflictException('Foreign key constraint failed');
        default:
          throw new InternalServerErrorException(
            `Database error: ${error.code}`,
          );
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new InternalServerErrorException(
        'Invalid data provided to database',
      );
    }

    throw error;
  }
}
