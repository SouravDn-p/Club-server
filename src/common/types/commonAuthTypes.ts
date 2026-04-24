import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface JwtUser {
  userId: number;
  email: string;
  role: UserRole;
}
