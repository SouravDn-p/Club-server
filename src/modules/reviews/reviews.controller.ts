import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/types/commonAuthTypes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags , ApiOperation } from '@nestjs/swagger';
import { UpdateReviewDto } from './dto/update-review.dto';


@Controller('reviews')
@ApiTags("reviews")
export class ReviewsController {
    constructor(private readonly reviews : ReviewsService){}


    @Get('analytics')
    @ApiOperation({ summary: 'Get review analytics (avg, total, breakdown)' })
    async getAnalytics() {
        const analytics =  await this.reviews.getReviewAnalytics();
      return analytics;
    }

    @Get()
    findAll(@Query  () query : PaginationDto){
        return this.reviews.findAllReviews(query)
    }

    @Get(':id')
    findOne(@Param ('id' , ParseIntPipe) id:number){
        return this.reviews.findOne(id)
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(@Body() data: CreateReviewDto , @CurrentUser() user : JwtUser){
        return this.reviews.createReview(data,user)
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateReviewDto,
    ) {
        return this.reviews.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviews.remove(id);
    }

}
