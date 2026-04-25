import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilmNotesService } from './film-notes.service';
import { CreateFilmNoteDto } from './dto/create-film-note.dto';
import { UpdateFilmNoteDto } from './dto/update-film-note.dto';
import { GetFilmNotesQueryDto } from './dto/get-film-notes-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { filmNoteMulterOptions } from 'src/config/multer.config';

type FilmNoteFiles = {
  pdf?: Express.Multer.File[];
  poster1?: Express.Multer.File[];
  poster2?: Express.Multer.File[];
};

@Controller('film-notes')
@ApiTags('film-notes')
export class FilmNotesController {
  constructor(private readonly service: FilmNotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all film notes' })
  getAll(@Query() query: GetFilmNotesQueryDto) {
    return this.service.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single film note' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a film note' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'poster1', maxCount: 1 },
        { name: 'poster2', maxCount: 1 },
      ],
      filmNoteMulterOptions,
    ),
  )
  create(
    @Body() dto: CreateFilmNoteDto,
    @UploadedFiles() files?: FilmNoteFiles,
  ) {
    return this.service.create(dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a film note' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'poster1', maxCount: 1 },
        { name: 'poster2', maxCount: 1 },
      ],
      filmNoteMulterOptions,
    ),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFilmNoteDto,
    @UploadedFiles() files?: FilmNoteFiles,
  ) {
    return this.service.update(id, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a film note' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unlock')
  @ApiOperation({ summary: 'Unlock film note content for a user' })
  unlock(
    @Param('id', ParseIntPipe) filmNoteId: number,
    @Body('category') category: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.unlockContent(filmNoteId, category, user.userId);
  }
}
