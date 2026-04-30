import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { FilmCategory } from '@prisma/client';

export class FilmNoteContentDto {
  @IsEnum(FilmCategory, {
    message: `category must be one of: ${Object.values(FilmCategory).join(', ')}`,
  })
  category: FilmCategory;

  @IsUrl()
  pdfUrl: string;
}

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
    description: 'Poster 1 image file',
  })
  @IsOptional()
  poster1?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Poster 2 image file',
  })
  @IsOptional()
  poster2?: any;

  @ApiPropertyOptional({ example: 'Sci-Fi masterpiece' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Wachowski Signature' })
  @IsOptional()
  @IsString()
  directorsSignature?: string;

  @ApiPropertyOptional({
    enum: FilmCategory,
    isArray: true,
    description: `Valid values: ${Object.values(FilmCategory).join(', ')}. Send as JSON array string in multipart: e.g. '["Film_Night","Film_Study"]'`,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    let arr: string[];
    if (typeof value === 'string') {
      try {
        arr = JSON.parse(value) as string[];
      } catch {
        arr = value.split(',').map((s: string) => s.trim());
      }
    } else {
      arr = Array.isArray(value) ? (value as string[]) : [String(value)];
    }

    // Filter to only valid enum values — ignore the rest
    const valid = arr.filter((v) =>
      Object.values(FilmCategory).includes(v as FilmCategory),
    );
    return valid.length > 0 ? valid : undefined;
  })
  @IsArray()
  @IsEnum(FilmCategory, { each: true })
  categories?: FilmCategory[];

  @ApiPropertyOptional({
    type: 'string',
    description:
      'JSON array: [{"category":"Film_Night","pdfUrl":"https://..."}]. Only needed if providing existing PDF URLs.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
      } catch {
        return undefined;
      }
    }

    return Array.isArray(value) && value.length > 0 ? value : undefined;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilmNoteContentDto)
  contents?: FilmNoteContentDto[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'PDF file to upload',
  })
  @IsOptional()
  pdf?: any;

  @ApiPropertyOptional({
    enum: FilmCategory,
    description: `Category for the uploaded PDF. Must be one of: ${Object.values(FilmCategory).join(', ')}`,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || !Object.values(FilmCategory).includes(value as FilmCategory))
      return undefined;
    return value as FilmCategory;
  })
  @IsEnum(FilmCategory)
  pdfCategory?: FilmCategory;
}
