import Stripe from 'stripe';
import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';

// ✅ Derive all types from the Stripe client — works regardless of version
type StripeClient = InstanceType<typeof Stripe>;
type StripeEvent = Awaited<ReturnType<StripeClient['webhooks']['constructEvent']>>;
type StripeCheckoutSession = Awaited<ReturnType<StripeClient['checkout']['sessions']['retrieve']>>;
type StripePaymentIntent = Awaited<ReturnType<StripeClient['paymentIntents']['retrieve']>>;
type StripeCharge = Awaited<ReturnType<StripeClient['charges']['retrieve']>>;

@Injectable()
export class PaymentService {
  private readonly stripe: StripeClient;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not defined');

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-04-22.dahlia',
    });
  }

  async getAllPayments(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true, plan: true },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data: payments,
      paginationMeta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCheckoutSession(userId: number, planId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new BadRequestException('User not found');

      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) throw new BadRequestException('Plan not found');

      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: { userId: String(userId) },
        });
        stripeCustomerId = customer.id;

        await this.prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });
      }

      const payment = await this.prisma.payment.create({
        data: {
          userId,
          planId,
          amount: plan.price,
          currency: plan.currency,
          status: 'PENDING',
          stripeCustomerId,
        },
      });

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: plan.currency.toLowerCase(),
              product_data: {
                name: plan.title,
                description: plan.description || undefined,
                images: plan.image ? [plan.image] : undefined,
              },
              unit_amount: Math.round(plan.price * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          paymentId: String(payment.id),
          userId: String(userId),
          planId: String(planId),
        },
        success_url: `${this.configService.get<string>('stripe.FRONTEND_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: this.configService.get<string>('stripe.FRONTEND_CANCEL_URL'),
      });

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { stripePaymentIntentId: session.payment_intent as string },
      });

      return { url: session.url };
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not defined');

    let event: StripeEvent;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    const obj = event.data.object as any;

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(obj as StripeCheckoutSession);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(obj as StripePaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(obj as StripeCharge);
        break;

      default:
        this.logger.log(`Unhandled event: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: StripeCheckoutSession) {
    const { paymentId, userId } = session.metadata || {};

    if (!paymentId) return;

    const payment = await this.prisma.payment.findUnique({
      where: { id: Number(paymentId) },
      include: { plan: true },
    });

    if (!payment || payment.status === 'SUCCEEDED') return;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          paidAt: new Date(),
          stripeChargeId: session.payment_intent as string,
        },
      });

      await tx.user.update({
        where: { id: Number(userId) },
        data: { credits: { increment: payment.plan.credits } },
      });
    });

    this.logger.log(`Payment ${payment.id} succeeded. Credits added.`);
  }

  private async handlePaymentIntentFailed(paymentIntent: StripePaymentIntent) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });
  }

  private async handleChargeRefunded(charge: StripeCharge) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
      include: { plan: true },
    });

    if (!payment || payment.status === 'REFUNDED') return;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      await tx.user.update({
        where: { id: payment.userId },
        data: { credits: { decrement: payment.plan.credits } },
      });
    });
  }

  async getPaymentStatus(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: session.payment_status,
      session,
    };
  }
}