import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prismaService: PrismaService) {}

    private formatDaily(data: any[], days: number) {
        const map = new Map<string, number>();
      
        // Initialize last N days with 0
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
      
          const key = d.toISOString().split('T')[0];
          map.set(key, 0);
        }
      
        // Aggregate actual data
        data.forEach(item => {
          const key = new Date(item.createdAt).toISOString().split('T')[0];
      
          map.set(key, (map.get(key) || 0) + (item.amount || 0));
        });
      
        // Convert to array (chart-ready)
        return Array.from(map.entries()).map(([date, total]) => ({
          date,
          total,
        }));
    }

    private formatMonthly(data: any[], months: number) {
        const map = new Map<string, number>();
      
        for (let i = months - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
      
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          map.set(key, 0);
        }
      
        data.forEach(item => {
          const d = new Date(item.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
          map.set(key, (map.get(key) || 0) + item.amount);
        });
      
        return Array.from(map.entries()).map(([month, total]) => ({
          month,
          total,
        }));
    }

    async getDailySales(days: number) {
        const start = new Date();
        start.setDate(start.getDate() - (days - 1));
        start.setHours(0, 0, 0, 0);
      
        const data = await this.prismaService.payment.findMany({
          where: {
            createdAt: {
              gte: start,
            },
          },
          select: {
            amount: true,
            createdAt: true,
          },
        });
      
        return this.formatDaily(data, days);
    }

    async getMonthlySales(months: number) {
        const start = new Date();
        start.setMonth(start.getMonth() - (months - 1));
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
      
        const data = await this.prismaService.payment.findMany({
          where: {
            createdAt: {
              gte: start,
            },
          },
          select: {
            amount: true,
            createdAt: true,
          },
        });
      
        return this.formatMonthly(data, months);
    }


    // routes api

    async getSalesReport(range: string) {
        switch (range) {
          case '7d':
            return this.getDailySales(7);
      
          case '30d':
            return this.getDailySales(30);
      
          case '6m':
            return this.getMonthlySales(6);
      
          case '12m':
            return this.getMonthlySales(12);
      
          default:
            return this.getMonthlySales(12);
        }
    }

    async getDashboardStats() {
        const start = new Date()
        start.setHours(0,0,0,0)
        const end = new Date()
        end.setHours(23,59,59,999)

        const [totalUsers, TotalSales , TodaysRevenue , TotalCustomers]  = await this.prismaService.$transaction([
            this.prismaService.user.count(),
            this.prismaService.payment.aggregate({
                _sum : {
                    amount : true
                }
            }),
            this.prismaService.payment.aggregate({
                _sum : {
                    amount : true 
                },
                where : {
                    createdAt : {
                        gte : start ,
                        lte : end
                    }
                }
            }),
            this.prismaService.payment.findMany({
                distinct: ['userId'],
                select: {userId:true}
            })
        ])

        return {
            totalUsers,
            TotalSales: TotalSales._sum.amount || 0,
            TodaysRevenue: TodaysRevenue._sum.amount || 0,
            TotalCustomers: TotalCustomers.length,
        }
    }

    async recentUsers (){
        const recentUsers = await this.prismaService.user.findMany({
            where : {
                role: UserRole.USER,
                isDeleted: false,
                isBlocked: false,
            } 
            ,
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            select : {
                id: true,
                name : true,
                email : true,
                createdAt : true ,
                avatarUrl : true ,
                location : true ,
            }

        })

        return recentUsers
    }
}
