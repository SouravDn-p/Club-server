import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FilmNotesService } from './film-notes.service';
import { CreateFilmNoteDto } from './dto/create-film-note.dto';
import { UpdateFilmNoteDto } from './dto/update-film-note.dto';
import { GetFilmNotesQueryDto } from './dto/get-film-notes-query.dto';
import { AddFilmNoteContentDto } from './dto/add-film-note-content.dto';
import { UnlockFilmNoteDto } from './dto/unlock-film-note.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { filmNoteMulterOptions, pdfMulterOptions } from 'src/config/multer.config';
import { Role } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

type FilmNoteFiles = {
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
  @ApiOperation({ summary: 'Create a film note basic info' })
  @ApiConsumes('multipart/form-data')
  @Role(UserRole.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poster1', maxCount: 1 },
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
  @Post(':id/content')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add content (PDF) to a film note by category' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('pdf', pdfMulterOptions))

  addContent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddFilmNoteContentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.addContent(id, dto.category, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a film note basic info' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
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
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a film note' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unlock')
  @ApiOperation({ summary: 'Unlock film note content for a user' })
  unlock(
    @Param('id', ParseIntPipe) filmNoteId: number,
    @Body() dto: UnlockFilmNoteDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.unlockContent(filmNoteId, dto.category, user.userId);
  }
}
