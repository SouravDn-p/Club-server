/*
  Warnings:

  - A unique constraint covering the columns `[userId,giftCardId]` on the table `GiftCardUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GiftCardUsage" ADD COLUMN     "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "usedAt" DROP NOT NULL,
ALTER COLUMN "usedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "GiftCardUsage_userId_giftCardId_key" ON "GiftCardUsage"("userId", "giftCardId");
