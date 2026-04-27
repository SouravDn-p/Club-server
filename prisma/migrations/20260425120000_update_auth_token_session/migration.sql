-- Clear existing tokens (they have no sessionId, all invalid anyway)
DELETE FROM "AuthToken";

-- Add sessionId as required unique column (safe now — table is empty)
ALTER TABLE "AuthToken" ADD COLUMN "sessionId" TEXT NOT NULL;
ALTER TABLE "AuthToken" ADD COLUMN "userAgent" TEXT;

-- Drop old accessToken column (no longer needed)
ALTER TABLE "AuthToken" DROP COLUMN IF EXISTS "accessToken";

-- Unique session per user
CREATE UNIQUE INDEX "AuthToken_sessionId_key" ON "AuthToken"("sessionId");

-- Index for fast userId lookups
CREATE INDEX IF NOT EXISTS "AuthToken_userId_idx" ON "AuthToken"("userId");
