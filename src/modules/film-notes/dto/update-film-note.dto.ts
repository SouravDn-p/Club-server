import { PartialType } from '@nestjs/swagger';
import { CreateFilmNoteDto } from './create-film-note.dto';

export class UpdateFilmNoteDto extends PartialType(CreateFilmNoteDto) {}
