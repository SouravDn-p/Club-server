import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class ApplyGiftCardDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsInt()
  planId: number;
}