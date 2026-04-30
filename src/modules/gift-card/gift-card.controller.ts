import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GiftCardService } from './gift-card.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { JwtUser } from 'src/common/types/commonAuthTypes';

import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { ClaimGiftCardDto } from './dto/claim-gift-card.dto';
import { ApplyGiftCardDto } from './dto/apply-gift-card.dto';

@Controller('gift-cards')
@ApiTags('gift-cards')
export class GiftCardController {
  constructor(private readonly service: GiftCardService) {}

  // ALL GIFT CARD
  @Get()
  getAll() {
    return this.service.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() dto: CreateGiftCardDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.create(dto, file);
  }

  //  CLAIM GIFT CARD
  @UseGuards(JwtAuthGuard)
  @Post('claim')
  claim(@Body() dto: ClaimGiftCardDto, @CurrentUser() user: JwtUser) {
    return this.service.claim(dto.id, user.userId);
  }

  //  APPLY GIFT CARD (during subscription purchase)
  @UseGuards(JwtAuthGuard)
  @Post('apply')
  apply(@Body() dto: ApplyGiftCardDto, @CurrentUser() user: JwtUser) {
    return this.service.apply(dto.giftCardId, dto.planId, user.userId);
  }
}
