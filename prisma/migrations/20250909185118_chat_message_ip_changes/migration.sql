/*
  Warnings:

  - You are about to drop the column `ipHash` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ChatMessage" DROP COLUMN "ipHash",
ADD COLUMN "ipV4" VARCHAR(15);
