import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';

@Controller('posts')
@ApiTags("posts")
export class PostsController {
    constructor(private readonly posts : PostsService){}

    @Get()
    @ApiOperation({ summary: 'Get All Posts' })
    async GetPosts(
        @Query() query : GetPostsQueryDto){
        return this.posts.GetPosts(query)
    }

    // Create Post
    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    async create(
        @Body() data : CreatePostDto,
        @UploadedFile() file : Express.Multer.File,
        @CurrentUser() user : JwtUser
    ){
         const result = await this.posts.create(data , file , user.userId);
    return result ;
    }


    @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.posts.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.posts.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.posts.remove(id);
  }

  // COMMENT
  @UseGuards(JwtAuthGuard)
  @Post('comment')
  comment(@Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    return this.posts.addComment(dto, user.userId);
  }

  // LIKE
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  like(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.posts.toggleLike(postId, user.userId);
  }
}
