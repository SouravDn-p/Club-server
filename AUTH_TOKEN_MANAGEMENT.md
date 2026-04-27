# Auth Token Management

## Overview

This project uses a **session-based refresh token** system. Every login creates a unique session identified by a UUID (`sessionId`). The `sessionId` is embedded in both the Access Token and Refresh Token payloads, and stored in the `AuthToken` table.

---

## How It Works

### Login Flow

```
POST /auth/login
```

1. Credentials are validated.
2. A `sessionId` (UUID v4) is generated.
3. Access Token (15m) and Refresh Token (7d) are signed — both contain `{ sub, email, role, sessionId }`.
4. The Refresh Token is **hashed with bcrypt** before being stored in `AuthToken`.
5. The raw tokens are set as **httpOnly cookies** (`accessToken`, `refreshToken`).
6. If the user already has **6 active sessions**, the oldest one is deleted before creating the new one.

### Session Isolation

| Scenario | Behaviour |
|---|---|
| Same browser profile, multiple tabs | Share the same cookies → same `sessionId` → one session |
| Different browser profiles | Different cookies → different `sessionId` → separate sessions |
| Different devices | Different cookies → different `sessionId` → separate sessions |

### Refresh Flow

```
POST /auth/refresh
```

1. The `refreshToken` cookie is verified by `RefreshStrategy`.
2. The `sessionId` is extracted from the token payload.
3. The matching `AuthToken` record is looked up by `sessionId`.
4. The raw token is compared against the stored bcrypt hash.
5. If valid and not expired, **only that session's record is updated** with a new hashed token.
6. New Access + Refresh tokens (same `sessionId`) are issued and set as cookies.

### Logout (Current Device)

```
POST /auth/logout
```

Deletes only the `AuthToken` record matching the current `sessionId`. Other sessions remain active.

### Logout All Devices

```
POST /auth/logout-all
```

Deletes **all** `AuthToken` records for the user. Every device is signed out immediately.

---

## AuthToken Schema

```prisma
model AuthToken {
  id           Int      @id @default(autoincrement())
  userId       Int
  sessionId    String   @unique   // UUID — one per login session
  userAgent    String?            // Browser/device identifier (optional)
  refreshToken String             // bcrypt-hashed refresh token
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

---

## JWT Payload

Both Access and Refresh tokens carry:

```ts
interface JwtPayload {
  sub: number;       // userId
  email: string;
  role: UserRole;
  sessionId: string; // UUID linking to AuthToken record
}
```

---

## Session Limits

- Maximum **6 concurrent sessions** per user.
- On the 7th login, the **oldest session** (by `createdAt`) is automatically evicted.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create account, returns tokens in cookies |
| `POST` | `/auth/login` | Public | Login, returns tokens in cookies |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate tokens for current session |
| `GET` | `/auth/me` | Access cookie | Get current user profile |
| `POST` | `/auth/logout` | Access cookie | Logout current device |
| `POST` | `/auth/logout-all` | Access cookie | Logout all devices |
| `GET` | `/auth/google` | Public | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | Public | Google OAuth callback |

---

## Security Notes

- Refresh tokens are **never stored in plain text** — always bcrypt-hashed.
- All cookies are `httpOnly`, `sameSite: strict`, and `secure` in production.
- Access tokens expire in **15 minutes**; Refresh tokens in **7 days**.
- Rotating refresh tokens: each `/auth/refresh` call issues a new token and updates the stored hash.
