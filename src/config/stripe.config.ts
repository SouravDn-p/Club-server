import { registerAs } from '@nestjs/config';

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  FRONTEND_SUCCESS_URL: string;
  FRONTEND_CANCEL_URL: string;
}

export default registerAs<StripeConfig>(
  'stripe',
  (): StripeConfig => ({
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    FRONTEND_SUCCESS_URL: process.env.FRONTEND_SUCCESS_URL!,
    FRONTEND_CANCEL_URL: process.env.FRONTEND_CANCEL_URL!,
  }),
);