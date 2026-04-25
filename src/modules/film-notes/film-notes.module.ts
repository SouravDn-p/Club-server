import { Module } from '@nestjs/common';
import { FilmNotesController } from './film-notes.controller';
import { FilmNotesService } from './film-notes.service';
import { PrismaModule } from 'src/services/prisma/prisma.module';
import { CloudinaryModule } from 'src/services/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [FilmNotesController],
  providers: [FilmNotesService]
})
export class FilmNotesModule {}
