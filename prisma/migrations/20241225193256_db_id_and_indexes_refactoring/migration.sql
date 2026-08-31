/*
  Warnings:

  - The primary key for the `ChatMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ChatMessage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Char(36)`.
  - You are about to alter the column `userId` on the `ChatMessage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Char(36)`.
  - The primary key for the `Emoji` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Emoji` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Char(36)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Char(36)`.

*/

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_pkey",
ALTER COLUMN "id" SET DATA TYPE CHAR(36),
ALTER COLUMN "userId" SET DATA TYPE CHAR(36),
ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Emoji" DROP CONSTRAINT "Emoji_pkey",
ALTER COLUMN "id" SET DATA TYPE CHAR(36),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(25),
ADD CONSTRAINT "Emoji_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE CHAR(36),
ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "chatMessage_createdAt_index" RENAME TO "ChatMessage_createdAt_index";

-- RenameIndex
ALTER INDEX "emoji_createdAt_index" RENAME TO "Emoji_createdAt_index";

-- RenameIndex
ALTER INDEX "user_createdAt_index" RENAME TO "User_createdAt_index";
