import { registerAs } from "@nestjs/config";

export interface DatabaseConfig {
  databaseUrl: string;
  databaseUser: string;
}

export default registerAs<DatabaseConfig>('database',
  (): DatabaseConfig => ({
    databaseUrl: process.env.DATABASE_URL!,
    databaseUser: process.env.DATABASE_USER!,
  }),
);
