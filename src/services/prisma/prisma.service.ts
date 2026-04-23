import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
 private readonly logger = new Logger(PrismaService.name);
 constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in the environment variables');
    }

    const pool = new Pool({
      connectionString: connectionString,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
  async onModuleInit() {
    this.logger.log('Prisma client connecting to database...');
    await this.$connect();
    this.logger.log('Successfully connected to the database via PrismaPg adapter');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}