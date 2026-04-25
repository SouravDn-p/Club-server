import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @ApiProperty({
    example: 'Pro Plan',
    description: 'Name of the subscription plan',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    example: 'Full access to all film notes and exclusive content.',
    description: 'Short description of what the plan includes',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 29.99,
    description: 'Plan price in USD',
    minimum: 0.01,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    example: 100,
    description: 'Credits granted to the user upon purchase',
    minimum: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  credits: number;

  @ApiProperty({
    type: [String],
    example: ['Access to all film notes', 'Download PDFs', 'Priority support'],
    description: 'Feature list for this plan — at least one required',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Plan cover image (jpeg, png, webp)',
  })
  @IsOptional()
  image?: any;
}
