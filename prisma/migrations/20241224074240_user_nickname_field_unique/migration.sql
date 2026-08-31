/*
  Warnings:

  - You are about to alter the column `nickname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(20)`.
  - A unique constraint covering the columns `[nickname]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/

-- TruncateTable
TRUNCATE TABLE "User";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET DATA TYPE CHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_unique" ON "User"("nickname");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
