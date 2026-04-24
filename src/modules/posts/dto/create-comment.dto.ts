import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  postId: number;

  @ApiProperty({ example: 'Nice blog!' })
  @IsString()
  comment: string;
}