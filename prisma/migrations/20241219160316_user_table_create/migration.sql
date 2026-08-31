/*
  Warnings:

  - The primary key for the `ChatMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ChatMessage` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/

-- TruncateTable
TRUNCATE TABLE "ChatMessage";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Administrator', 'Moderator', 'User', 'Guest');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Inactive', 'Pending');

-- AlterTable
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_pkey",
ADD COLUMN     "userId" VARCHAR(100),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "nickname" DROP NOT NULL,
ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "UserRole" NOT NULL DEFAULT 'User',
    "status" "UserStatus" NOT NULL DEFAULT 'Pending',
    "nickname" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_createdAt_index" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "chatMessage_createdAt_index" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_FK" ON "ChatMessage"("userId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
