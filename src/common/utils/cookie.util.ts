import type { Response } from 'express';

const IS_PROD = process.env.NODE_ENV == 'production';


const BASE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  path: "/"
} as const;

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  console.log("🚀 ~ IS_PROD:", IS_PROD)
  res.cookie('accessToken', tokens.accessToken, {
    ...BASE_OPTIONS,
    // maxAge: 15 * 60 * 1000,  15 minutes
    maxAge: 1 * 24 * 60 * 60 * 1000, // 24 hours
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...BASE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', BASE_OPTIONS);
  res.clearCookie('refreshToken', BASE_OPTIONS);
}
