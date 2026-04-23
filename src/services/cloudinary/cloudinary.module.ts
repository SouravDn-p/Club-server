import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProviders } from './cloudinary.provider';

@Module({
  providers: [ CloudinaryProviders , CloudinaryService],
  exports : [CloudinaryProviders , CloudinaryService]
})
export class CloudinaryModule {}
