import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/services/prisma/prisma.module';
import { CloudinaryModule } from 'src/services/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule , CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
