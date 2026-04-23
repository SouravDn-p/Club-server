import { UserRole } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";


export interface User {
  id: number;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  passwordHash?: string | null;
  role: UserRole;
  walletBalance: Decimal;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  deletedAt?: Date | null;
}

export interface SafeUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  avatarUrl: string
  isVerified: boolean
  isBlocked: boolean
  isDeleted: boolean
  role: UserRole
  walletBalance: Decimal
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  deletedAt: Date | null
}
