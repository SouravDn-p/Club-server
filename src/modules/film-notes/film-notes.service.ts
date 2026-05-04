import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FilmCategory, Prisma } from '@prisma/client';

import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateFilmNoteDto } from './dto/create-film-note.dto';
import { UpdateFilmNoteDto } from './dto/update-film-note.dto';
import { GetFilmNotesQueryDto } from './dto/get-film-notes-query.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Injectable()
export class FilmNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private safeSelect = {
    id: true,
    name: true,
    description: true,
    year: true,
    genre: true,
    directorName: true,
    writerName: true,
    poster1: true,
    poster2: true,
    shortDescription: true,
    directorsSignature: true,
    createdAt: true,

    categories: {
      select: {
        id: true,
        category: true,
      },
    },

    contents: {
      select: {
        id: true,
        category: true,
        pdfUrl: true,
      },
    },
  };

  //  GET ALL (pagination + search + filter)
  async getAll(query: GetFilmNotesQueryDto) {
    const { page = 1, limit = 10, search, genre } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FilmNoteWhereInput = {
      AND: [
        search
          ? {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {},
        genre
          ? {
              genre: {
                contains: genre,
                mode: 'insensitive',
              },
            }
          : {},
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.filmNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.safeSelect,
      }),
      this.prisma.filmNote.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //  GET ONE
  async getOne(id: number) {
    const film = await this.prisma.filmNote.findUnique({
      where: { id },
      select: {
        ...this.safeSelect,
      },
    });

    if (!film) throw new NotFoundException('Film note not found');

    return film;
  }

  // CREATE BASIC INFO
  async create(
    dto: CreateFilmNoteDto,
    files?: {
      poster1?: Express.Multer.File[];
      poster2?: Express.Multer.File[];
    },
  ) {
    try {
      let poster1Url: string | undefined;
      let poster2Url: string | undefined;

      if (files?.poster1?.[0]) {
        const upload = await this.cloudinary.uploadFile(
          files.poster1[0],
          'film-notes/posters',
          'image',
        );
        poster1Url = upload.url;
      }
      if (files?.poster2?.[0]) {
        const upload = await this.cloudinary.uploadFile(
          files.poster2[0],
          'film-notes/posters',
          'image',
        );
        poster2Url = upload.url;
      }

      return await this.prisma.filmNote.create({
        data: {
          name: dto.name,
          description: dto.description,
          year: dto.year,
          genre: dto.genre,
          directorName: dto.directorName,
          writerName: dto.writerName,
          poster1: poster1Url ?? null,
          poster2: poster2Url ?? null,
          shortDescription: dto.shortDescription,
          directorsSignature: dto.directorsSignature,
        },
        select: this.safeSelect,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // ADD CONTENT (PDF)
  async addContent(
    filmNoteId: number,
    category: FilmCategory,
    file?: Express.Multer.File,
  ) {
    try {
      if (!file) throw new BadRequestException('PDF file is required');
      // Check if film note exists
      const filmNote = await this.prisma.filmNote.findUnique({
        where: { id: filmNoteId },
      });
      if (!filmNote) throw new NotFoundException('Film note not found');

      // Upload PDF
      const upload = await this.cloudinary.uploadFile(
        file,
        'film-notes/pdfs',
        'pdf',
      );

      // Create or update content
      const content = await this.prisma.filmNoteContent.upsert({
        where: {
          filmNoteId_category: {
            filmNoteId,
            category,
          },
        },
        update: {
          pdfUrl: upload.url,
        },
        create: {
          filmNoteId,
          category,
          pdfUrl: upload.url,
        },
      });

      // Also ensure it's in categories (for tagging)
      await this.prisma.filmNoteCategory.upsert({
        where: {
          filmNoteId_category: {
            filmNoteId,
            category,
          },
        },
        update: {},
        create: {
          filmNoteId,
          category,
        },
      });

      return content;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  //  UPDATE BASIC INFO
  async update(
    id: number,
    dto: UpdateFilmNoteDto,
    files?: {
      poster1?: Express.Multer.File[];
      poster2?: Express.Multer.File[];
    },
  ) {
    try {
      const updateData: Prisma.FilmNoteUpdateInput = { ...dto };

      if (files?.poster1?.[0]) {
        const upload = await this.cloudinary.uploadFile(
          files.poster1[0],
          'film-notes/posters',
          'image',
        );
        updateData.poster1 = upload.url;
      }
      if (files?.poster2?.[0]) {
        const upload = await this.cloudinary.uploadFile(
          files.poster2[0],
          'film-notes/posters',
          'image',
        );
        updateData.poster2 = upload.url;
      }

      return await this.prisma.filmNote.update({
        where: { id },
        data: updateData,
        select: this.safeSelect,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  //  DELETE
  async remove(id: number) {
    try {
      return await this.prisma.filmNote.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  //  UNLOCK CONTENT
  async unlockContent(filmNoteId: number, category: FilmCategory, userId: number) {
    try {
      const existing = await this.prisma.unlockedContent.findUnique({
        where: {
          userId_filmNoteId_category: {
            userId,
            filmNoteId,
            category: category as FilmCategory,
          },
        },
      });

      if (existing) {
        return {
          message: 'Already unlocked',
          unlocked: true,
        };
      }

      await this.prisma.unlockedContent.create({
        data: {
          userId,
          filmNoteId,
          category: category as FilmCategory,
        },
      });

      return {
        message: 'Content unlocked',
        unlocked: true,
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
