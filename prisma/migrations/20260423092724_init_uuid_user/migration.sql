/*
  Warnings:

  - The primary key for the `AuthToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AuthToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FilmNote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FilmNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FilmNoteCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FilmNoteCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FilmNoteContent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FilmNoteContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `GiftCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `GiftCard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `GiftCardUsage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `GiftCardUsage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PostComment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PostComment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PostLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PostLike` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Review` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SubscriptionFeature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SubscriptionFeature` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SubscriptionPlan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SubscriptionPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UnlockedContent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UnlockedContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lastSubscriptionPlanId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `AuthToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `filmNoteId` on the `FilmNoteCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `filmNoteId` on the `FilmNoteContent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `GiftCardUsage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `giftCardId` on the `GiftCardUsage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `planId` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authorId` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `postId` on the `PostComment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `PostComment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `postId` on the `PostLike` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `PostLike` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `planId` on the `SubscriptionFeature` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `UnlockedContent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `filmNoteId` on the `UnlockedContent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "AuthToken" DROP CONSTRAINT "AuthToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "FilmNoteCategory" DROP CONSTRAINT "FilmNoteCategory_filmNoteId_fkey";

-- DropForeignKey
ALTER TABLE "FilmNoteContent" DROP CONSTRAINT "FilmNoteContent_filmNoteId_fkey";

-- DropForeignKey
ALTER TABLE "GiftCardUsage" DROP CONSTRAINT "GiftCardUsage_giftCardId_fkey";

-- DropForeignKey
ALTER TABLE "GiftCardUsage" DROP CONSTRAINT "GiftCardUsage_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_planId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionFeature" DROP CONSTRAINT "SubscriptionFeature_planId_fkey";

-- DropForeignKey
ALTER TABLE "UnlockedContent" DROP CONSTRAINT "UnlockedContent_filmNoteId_fkey";

-- DropForeignKey
ALTER TABLE "UnlockedContent" DROP CONSTRAINT "UnlockedContent_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_lastSubscriptionPlanId_fkey";

-- AlterTable
ALTER TABLE "AuthToken" DROP CONSTRAINT "AuthToken_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FilmNote" DROP CONSTRAINT "FilmNote_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FilmNote_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FilmNoteCategory" DROP CONSTRAINT "FilmNoteCategory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "filmNoteId",
ADD COLUMN     "filmNoteId" INTEGER NOT NULL,
ADD CONSTRAINT "FilmNoteCategory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FilmNoteContent" DROP CONSTRAINT "FilmNoteContent_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "filmNoteId",
ADD COLUMN     "filmNoteId" INTEGER NOT NULL,
ADD CONSTRAINT "FilmNoteContent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GiftCardUsage" DROP CONSTRAINT "GiftCardUsage_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "giftCardId",
ADD COLUMN     "giftCardId" INTEGER NOT NULL,
ADD CONSTRAINT "GiftCardUsage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "planId",
ADD COLUMN     "planId" INTEGER NOT NULL,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Post" DROP CONSTRAINT "Post_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD CONSTRAINT "Post_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "postId",
ADD COLUMN     "postId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "postId",
ADD COLUMN     "postId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Review" DROP CONSTRAINT "Review_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Review_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SubscriptionFeature" DROP CONSTRAINT "SubscriptionFeature_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "planId",
ADD COLUMN     "planId" INTEGER NOT NULL,
ADD CONSTRAINT "SubscriptionFeature_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP CONSTRAINT "SubscriptionPlan_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UnlockedContent" DROP CONSTRAINT "UnlockedContent_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "filmNoteId",
ADD COLUMN     "filmNoteId" INTEGER NOT NULL,
ADD CONSTRAINT "UnlockedContent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "lastSubscriptionPlanId",
ADD COLUMN     "lastSubscriptionPlanId" INTEGER,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UnlockedContent_userId_filmNoteId_category_key" ON "UnlockedContent"("userId", "filmNoteId", "category");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lastSubscriptionPlanId_fkey" FOREIGN KEY ("lastSubscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionFeature" ADD CONSTRAINT "SubscriptionFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardUsage" ADD CONSTRAINT "GiftCardUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardUsage" ADD CONSTRAINT "GiftCardUsage_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilmNoteCategory" ADD CONSTRAINT "FilmNoteCategory_filmNoteId_fkey" FOREIGN KEY ("filmNoteId") REFERENCES "FilmNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilmNoteContent" ADD CONSTRAINT "FilmNoteContent_filmNoteId_fkey" FOREIGN KEY ("filmNoteId") REFERENCES "FilmNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedContent" ADD CONSTRAINT "UnlockedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedContent" ADD CONSTRAINT "UnlockedContent_filmNoteId_fkey" FOREIGN KEY ("filmNoteId") REFERENCES "FilmNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
