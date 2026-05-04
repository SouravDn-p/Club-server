import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { FilmCategory } from '@prisma/client';

export class AddFilmNoteContentDto {
  @ApiProperty({
    enum: FilmCategory,
    description: `Category for the PDF. Must be one of: ${Object.values(FilmCategory).join(', ')}`,
  })
  @IsNotEmpty()
  @IsEnum(FilmCategory)
  category: FilmCategory;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'PDF file to upload',
  })
  @IsOptional()
  pdf?: any;
}
