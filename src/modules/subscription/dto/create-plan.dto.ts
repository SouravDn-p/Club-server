import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreatePlanDto {
  @ApiProperty({ example: 'Pro Plan', description: 'Name of the subscription plan', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    example: 'Full access to all film notes and exclusive content.',
    description: 'Short description of what the plan includes',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 29.99, description: 'Plan price in USD', minimum: 0.01, type: Number })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({ example: 100, description: 'Credits granted on purchase', minimum: 1, type: Number })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  credits: number;

  @ApiProperty({
    example: '["Access to all film notes","Download PDFs","Priority support"]',
    description: 'JSON array of feature strings — send as a JSON string in multipart',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return [value]; }
    }
    return value;
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Plan cover image (jpeg, png, webp) — required on create',
  })
  @IsOptional()
  image?: any;
}
