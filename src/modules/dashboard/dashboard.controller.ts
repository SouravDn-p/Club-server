import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiResponseHelper } from 'src/common/utils/api-response.util';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @UseGuards(JwtAuthGuard)
    @Role(UserRole.ADMIN)
    @Get('stats')
    async getDashboardStats() {
        const result = await this.dashboardService.getDashboardStats();
        return ApiResponseHelper.success(result, 'Dashboard stats fetched successfully', HttpStatus.OK);
    }


    @UseGuards(JwtAuthGuard)
    @Role(UserRole.ADMIN)
    @Get('sales-report')
    async getDashboardSales(@Query('range') range:string ) {
        const result = await this.dashboardService.getSalesReport(range)
        return ApiResponseHelper.success(result, 'Dashboard stats fetched successfully', HttpStatus.OK);
    }

    @UseGuards(JwtAuthGuard)
    @Role(UserRole.ADMIN)
    @Get('recent-users')
    async getRecentUsers() {
        const result = await this.dashboardService.recentUsers()
        return ApiResponseHelper.success(result, 'Recent users fetched successfully', HttpStatus.OK);
    }
}
