-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('User', 'System');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "type" "ChatMessageType" NOT NULL DEFAULT 'User';
