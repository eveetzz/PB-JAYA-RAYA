/*
  Warnings:

  - You are about to drop the column `username` on the `MUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `MUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `MUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MUser_username_key";

-- AlterTable
ALTER TABLE "MUser" DROP COLUMN "username",
ADD COLUMN     "email" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MUser_email_key" ON "MUser"("email");
