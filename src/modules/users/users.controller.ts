import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Role } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';
import {  FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/types/commonAuthTypes';

@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Role(UserRole.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @Role(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Role(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @CurrentUser() user : JwtUser,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file : Express.Multer.File
  ) {
    return this.usersService.update(user.userId, updateUserDto , file);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-block')
  @Role(UserRole.ADMIN)
  async toggleBlock(@Param('id', ParseIntPipe) id: number) {
    const {user, message} = await this.usersService.toggleBlockStatus(id);
    return ApiResponseHelper.success(user, message, HttpStatus.OK);
  }
}
