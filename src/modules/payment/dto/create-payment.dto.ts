import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({example: 1})
  @IsInt()
  planId: number;
}
