/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `MAtlet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idPbsi]` on the table `MAtlet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `MPelatih` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idPbsi` to the `MAtlet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `MAtlet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `MPelatih` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MAtlet" ADD COLUMN     "idPbsi" VARCHAR(20) NOT NULL,
ADD COLUMN     "nik" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "MPelatih" ADD COLUMN     "nik" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MAtlet_nik_key" ON "MAtlet"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "MAtlet_idPbsi_key" ON "MAtlet"("idPbsi");

-- CreateIndex
CREATE UNIQUE INDEX "MPelatih_nik_key" ON "MPelatih"("nik");
