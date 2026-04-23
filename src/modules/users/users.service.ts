import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User as PrismaUser } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { SafeUser } from './types/userTypes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    avatarUrl: true,
    isVerified: true,
    isBlocked: true,
    isDeleted: true,
    role: true,
    walletBalance: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
    deletedAt: true,
  };

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user as unknown as SafeUser;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: this.userSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users as unknown as SafeUser[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const { password, ...userData } = createUserDto;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
 try {
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: passwordHash,
      },
      select: this.userSelect,
    });
    return user as unknown as SafeUser;
     } catch (error)  {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[];

        if (target?.includes('email')) {
          throw new ConflictException('Email already exists');
        }

        if (target?.includes('phone')) {
          throw new ConflictException('Phone number already exists');
        }

        throw new ConflictException('Unique field already exists');
      }

      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    await this.findOne(id); // Ensure user exists
    
    const { password, ...userData } = updateUserDto;
    const updateData: any = { ...userData };
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: this.userSelect,
    });
    return user as unknown as SafeUser;
  }

  async remove(id: number): Promise<SafeUser> {
    await this.findOne(id); // Ensure user exists
    const user = await this.prisma.user.delete({
      where: { id },
      select: this.userSelect,
    });
    return user as unknown as SafeUser;
  }
}
