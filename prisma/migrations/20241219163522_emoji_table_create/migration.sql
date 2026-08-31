/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/

-- TruncateTable
TRUNCATE TABLE "ChatMessage", "User";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey" CASCADE,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Emoji" (
    "id" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" CHAR(25) NOT NULL,
    "imageUrl" VARCHAR(100) NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "uiHidden" BOOLEAN NOT NULL DEFAULT false,
    "uiColorInverted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Emoji_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Emoji_code_unique" ON "Emoji"("code");

-- CreateIndex
CREATE INDEX "emoji_createdAt_index" ON "Emoji"("createdAt");
