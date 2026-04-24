import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Blog' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is the content of the blog' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'Short description...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  // Swagger UI only — actual file handled by @UploadedFile(), not body validation
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Post image file',
  })
  @IsOptional()
  image?: any;
}