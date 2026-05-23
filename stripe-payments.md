# Stripe Payments Integration

This document provides an overview of the Stripe payments integration in the Club server application.

## Overview

The payment module integrates with Stripe to handle subscription plan payments using **Checkout Sessions** and Webhooks. The system supports:

- Creating Stripe customers
- Hosted Stripe Checkout Sessions
- Webhook event handling (payment success, failure, refunds)
- Credit allocation upon successful payments
- Payment status tracking

## Architecture

### Database Schema

**User Model:**
- `stripeCustomerId`: Unique Stripe customer ID (optional)

**Payment Model:**
- `stripePaymentIntentId`: Stripe Payment Intent ID (set after checkout session creation)
- `stripeChargeId`: Stripe Charge ID (set after successful payment via webhook)
- `stripeCustomerId`: Associated Stripe customer ID
- `status`: Payment status (`PENDING`, `SUCCEEDED`, `FAILED`, `CANCELED`, `REFUNDED`)
- `amount`: Payment amount
- `currency`: Payment currency (e.g. USD, BDT)
- `paidAt`: Timestamp of successful payment
- `failureReason`: Reason for payment failure (if applicable)

### Configuration

Stripe configuration is managed through environment variables and loaded via `src/config/stripe.config.ts`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_SUCCESS_URL=https://your-frontend.com/payment/success
FRONTEND_CANCEL_URL=https://your-frontend.com/payment/cancel
```

## API Endpoints

### 1. Create Checkout Session

**Endpoint:** `POST /payments/create-checkout-session`
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "planId": 1
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Process:**
1. Validates the user and subscription plan
2. Creates or retrieves a Stripe customer for the user (persists `stripeCustomerId` on the user)
3. Creates a `PENDING` payment record in the database
4. Creates a Stripe Checkout Session in `payment` mode with plan details
5. Saves the `payment_intent` ID from the session back to the payment record
6. Returns the hosted Checkout URL — redirect the user to this URL to complete payment

---

### 2. Get Payment Status

**Endpoint:** `GET /payments/status?sessionId=cs_test_...`
**Authentication:** None
**Query Parameters:**
- `sessionId`: The Stripe Checkout Session ID (from the `?session_id=` query param on your success URL)

**Response:**
```json
{
  "status": "paid",
  "session": { ... }
}
```

**Use case:** Call this on your success page to confirm payment status before showing a confirmation UI.

---

### 3. Webhook Handler

**Endpoint:** `POST /payments/webhook`
**Authentication:** None (Stripe signature verification only)
**Headers:**
- `stripe-signature`: Stripe webhook signature

> ⚠️ This endpoint requires the **raw request body** (not JSON-parsed). Ensure your NestJS app excludes this route from the global `json()` body parser.

**Handled Events:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Marks payment `SUCCEEDED`, sets `paidAt`, increments user credits |
| `payment_intent.payment_failed` | Marks payment `FAILED`, stores failure reason |
| `charge.refunded` | Marks payment `REFUNDED`, decrements user credits |

---

### 4. Get All Payments (Admin)

**Endpoint:** `GET /payments`
**Authentication:** Required (JWT + `ADMIN` role)
**Query Parameters:**
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `10`)

**Response:**
```json
{
  "data": [...],
  "paginationMeta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## Payment Flow

### End-to-End Flow

```
Frontend                    Backend                      Stripe
   |                           |                            |
   |-- POST /create-checkout -->|                            |
   |                           |-- Create customer -------->|
   |                           |-- Create session --------->|
   |<-- { url } --------------|                            |
   |                           |                            |
   |-- Redirect to url ------->|--------------------------->|
   |                           |       User pays on Stripe  |
   |<-- Redirect to success ---|<---------------------------|
   |    (?session_id=cs_...)   |                            |
   |                           |                            |
   |-- GET /status?sessionId ->|-- Retrieve session ------->|
   |<-- { status: "paid" } ---|<---------------------------|
   |                           |                            |
   |                           |<-- Webhook: session.completed
   |                           |    (async, guaranteed)     |
   |                           |-- Update DB + add credits  |
```

### Frontend Integration

**Step 1 — Create the session and redirect:**
```typescript
const res = await fetch('/payments/create-checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ planId: 1 }),
});
const { url } = await res.json();
window.location.href = url; // Redirect to Stripe hosted checkout
```

**Step 2 — On the success page (reading `?session_id` from the URL):**
```typescript
const sessionId = new URLSearchParams(window.location.search).get('session_id');

const res = await fetch(`/payments/status?sessionId=${sessionId}`);
const { status } = await res.json();

if (status === 'paid') {
  // Show success UI
}
```

**Step 3 — Webhook handles credit allocation automatically (no frontend action needed)**

---

## Webhook Event Details

### `checkout.session.completed`
- Looks up the payment record via `session.metadata.paymentId`
- Skips processing if payment is already `SUCCEEDED` (idempotent)
- In a single DB transaction:
  - Updates payment status to `SUCCEEDED`, sets `paidAt` and `stripeChargeId`
  - Increments user credits by the plan's credit amount

### `payment_intent.payment_failed`
- Looks up the payment record via `stripePaymentIntentId`
- Updates status to `FAILED` with the Stripe error message as `failureReason`

### `charge.refunded`
- Looks up the payment record via `stripeChargeId`
- Skips if already `REFUNDED` (idempotent)
- In a single DB transaction:
  - Updates payment status to `REFUNDED`
  - Decrements user credits by the plan's credit amount

---

## Security

1. **Webhook Signature Verification:** Every webhook request is verified using `stripe-signature` and `STRIPE_WEBHOOK_SECRET` before processing.
2. **Idempotency:** All webhook handlers check current payment status before applying changes to prevent duplicate processing.
3. **Transaction Safety:** Credit updates and payment status changes are wrapped in Prisma transactions.
4. **Customer Isolation:** Each user has a dedicated Stripe customer ID stored on their record.
5. **No Auth on Webhook:** The webhook endpoint intentionally has no JWT guard — Stripe signature verification is the sole trust mechanism.

---

## Raw Body Setup

Stripe webhook verification requires the **raw** (unparsed) request body. In your `main.ts`, exclude the webhook route from the global JSON parser:

```typescript
app.use('/payments/webhook', express.raw({ type: 'application/json' }));
```

Ensure this is registered **before** `app.useGlobalPipes` or any body parser middleware.

---

## Local Development

Use the Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:5000/payments/webhook
```

Trigger test events:

```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

---

## Error Handling

| Scenario | HTTP Status |
|---|---|
| User not found | 400 Bad Request |
| Plan not found | 400 Bad Request |
| Invalid webhook signature | 400 Bad Request |
| Prisma / DB errors | Handled via `handlePrismaError` |

---

## Database Migration

After schema changes, run:

```bash
npx prisma migrate dev --name add_stripe_fields
npx prisma generate
```

---

## Troubleshooting

**Payment stuck in PENDING**
- Confirm the webhook endpoint is publicly accessible (use Stripe CLI locally)
- Verify `STRIPE_WEBHOOK_SECRET` matches the one in your Stripe Dashboard
- Check that raw body is passed to the webhook handler (not parsed JSON)

**Credits not added after payment**
- Check server logs for webhook handler errors
- Confirm `checkout.session.completed` is in your webhook's subscribed events in Stripe Dashboard
- Verify `metadata.paymentId` is present on the session

**Webhook signature verification failed**
- Ensure raw body middleware is applied before JSON middleware for `/payments/webhook`
- Confirm the secret is from the correct webhook endpoint (test vs. live)