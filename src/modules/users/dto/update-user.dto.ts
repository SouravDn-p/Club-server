import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {  IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
    @ApiPropertyOptional({
      example: 'Sourav Debnath',
      description: 'Full name of the user',
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;
  
    @ApiPropertyOptional({ example: '+1234567890' })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    phone?: string;
  
    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    @IsOptional()
    avatar?: any;
  }
