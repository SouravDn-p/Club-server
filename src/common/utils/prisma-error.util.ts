import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
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