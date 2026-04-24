import { UserRole } from '@prisma/client';

// Matches the Prisma User model (without password)
export interface SafeUser {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  provider: string | null;
  isVerified: boolean;
  isDeleted: boolean;
  isBlocked: boolean;
  role: UserRole;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}
