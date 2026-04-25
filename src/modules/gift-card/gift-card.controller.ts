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
import { CreateGiftCardDto } from './dto/create-gift-card.dto';

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
  claim(@Body() dto, @CurrentUser() user: any) {
    return this.service.claim(dto.code, user.userId);
  }

  //  APPLY GIFT CARD (during subscription purchase)
  @UseGuards(JwtAuthGuard)
  @Post('apply')
  apply(@Body() dto, @CurrentUser() user: any) {
    return this.service.apply(dto.code, dto.planId, user.userId);
  }
}