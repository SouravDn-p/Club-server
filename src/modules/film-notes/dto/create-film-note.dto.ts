import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFilmNoteDto {
  @ApiProperty({ example: 'The Matrix' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'A computer hacker learns from mysterious rebels...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1999 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'Sci-Fi' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ example: 'Lana Wachowski, Lilly Wachowski' })
  @IsOptional()
  @IsString()
  directorName?: string;

  @ApiPropertyOptional({ example: 'Lana Wachowski, Lilly Wachowski' })
  @IsOptional()
  @IsString()
  writerName?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Poster image file',
  })
  @IsOptional()
  poster1?: any;


  @ApiPropertyOptional({ example: 'Sci-Fi masterpiece' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Wachowski Signature' })
  @IsOptional()
  @IsString()
  directorsSignature?: string;
}
