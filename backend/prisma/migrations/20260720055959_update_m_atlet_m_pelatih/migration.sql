/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `MAtlet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `MPelatih` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `MAtlet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `MPelatih` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MAtlet" ADD COLUMN     "email" VARCHAR(50) NOT NULL,
ALTER COLUMN "foto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MPelatih" ADD COLUMN     "email" VARCHAR(50) NOT NULL,
ALTER COLUMN "foto" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MAtlet_email_key" ON "MAtlet"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MPelatih_email_key" ON "MPelatih"("email");
