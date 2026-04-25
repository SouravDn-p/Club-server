import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ClaimGiftCardDto {
  @ApiProperty({ example: 'WELCOME100' })
  @IsString()
  code: string;
}