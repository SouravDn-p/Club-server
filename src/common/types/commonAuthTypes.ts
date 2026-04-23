import { UserRole } from "@prisma/client";

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface JwtUser {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}
