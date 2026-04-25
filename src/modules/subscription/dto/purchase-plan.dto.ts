import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchasePlanDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the subscription plan to purchase',
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  planId: number;
}
