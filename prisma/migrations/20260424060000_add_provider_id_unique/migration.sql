-- Add unique constraint on (provider, providerId) for social login deduplication
-- Using a partial index so NULL values (non-social users) are excluded
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId") WHERE "provider" IS NOT NULL AND "providerId" IS NOT NULL;
