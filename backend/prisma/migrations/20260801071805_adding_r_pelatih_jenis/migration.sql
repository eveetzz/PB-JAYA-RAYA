/*
  Warnings:

  - The values [pelatih_teknik,pelatih_fisik] on the enum `RoleUser` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[uidPelatih]` on the table `RPelatihSektor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uidSektor]` on the table `RPelatihSektor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "jenisPelatih" AS ENUM ('pelatih_teknik', 'pelatih_fisik');

-- AlterEnum
BEGIN;
CREATE TYPE "RoleUser_new" AS ENUM ('Admin', 'Manajemen', 'Pelatih', 'Atlet');
ALTER TABLE "MUser" ALTER COLUMN "role" TYPE "RoleUser_new" USING ("role"::text::"RoleUser_new");
ALTER TYPE "RoleUser" RENAME TO "RoleUser_old";
ALTER TYPE "RoleUser_new" RENAME TO "RoleUser";
DROP TYPE "public"."RoleUser_old";
COMMIT;

-- AlterTable
ALTER TABLE "RPelatihSektor" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "RPelatihJenis" (
    "uidJenis" VARCHAR(36) NOT NULL,
    "uidPelatih" VARCHAR(36) NOT NULL,
    "jenisPelatih" "jenisPelatih" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "RPelatihJenis_pkey" PRIMARY KEY ("uidJenis")
);

-- CreateIndex
CREATE UNIQUE INDEX "RPelatihJenis_uidPelatih_key" ON "RPelatihJenis"("uidPelatih");

-- CreateIndex
CREATE UNIQUE INDEX "RPelatihSektor_uidPelatih_key" ON "RPelatihSektor"("uidPelatih");

-- CreateIndex
CREATE UNIQUE INDEX "RPelatihSektor_uidSektor_key" ON "RPelatihSektor"("uidSektor");

-- AddForeignKey
ALTER TABLE "RPelatihJenis" ADD CONSTRAINT "RPelatihJenis_uidPelatih_fkey" FOREIGN KEY ("uidPelatih") REFERENCES "MPelatih"("uidPelatih") ON DELETE RESTRICT ON UPDATE CASCADE;
