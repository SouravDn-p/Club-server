import type { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

const BASE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'strict' as const,
};

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie('accessToken', tokens.accessToken, {
    ...BASE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...BASE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}
