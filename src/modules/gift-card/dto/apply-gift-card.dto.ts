import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ApplyGiftCardDto {
  @ApiProperty({ 
    example: 1, 
    description: 'The unique ID of the gift card to be applied' 
  })
  @IsInt()
  @IsNotEmpty()
  giftCardId: number; // Renamed from 'id' for better clarity in the API

  @ApiProperty({ 
    example: 1, 
    description: 'The ID of the subscription plan the user is purchasing' 
  })
  @IsInt()
  @IsNotEmpty()
  planId: number;
}