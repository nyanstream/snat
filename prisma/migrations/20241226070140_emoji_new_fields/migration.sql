-- AlterTable
ALTER TABLE "Emoji" ADD COLUMN     "priorityOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uiReversedX" BOOLEAN NOT NULL DEFAULT false;
