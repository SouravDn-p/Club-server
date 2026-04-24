import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CloudinaryModule } from 'src/services/cloudinary/cloudinary.module';

@Module({
  imports : [CloudinaryModule],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
