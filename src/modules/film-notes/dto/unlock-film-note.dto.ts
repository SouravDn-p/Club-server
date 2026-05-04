import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FilmCategory } from '@prisma/client';

export class UnlockFilmNoteDto {
  @ApiProperty({
    enum: FilmCategory,
    description: `Category to unlock. Must be one of: ${Object.values(FilmCategory).join(', ')}`,
  })
  @IsNotEmpty()
  @IsEnum(FilmCategory)
  category: FilmCategory;
}
