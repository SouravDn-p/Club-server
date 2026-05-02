import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class UpdateGiftCardDto {
  @ApiPropertyOptional({ example: 'WELCOME100' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Gift card image',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  image?: any;
}
