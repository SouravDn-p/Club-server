import { Module } from '@nestjs/common';
import { GiftCardController } from './gift-card.controller';
import { GiftCardService } from './gift-card.service';
import { CloudinaryModule } from 'src/services/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [GiftCardController],
  providers: [GiftCardService],
})
export class GiftCardModule {}
