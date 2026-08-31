/*
  Warnings:

  - A unique constraint covering the columns `[discordUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chatovodUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatovodUserId" VARCHAR(20),
ADD COLUMN     "discordUserId" VARCHAR(20),
ADD COLUMN     "lastOnlineAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "User_discordUserId_unique" ON "User"("discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_chatovodUserId_unique" ON "User"("chatovodUserId");
