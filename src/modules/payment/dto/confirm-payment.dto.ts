import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty()
  @IsInt()
  paymentId: number;
}
