/*
  Warnings:

  - You are about to drop the column `beratBadan` on the `MAtlet` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `MAtlet` table. All the data in the column will be lost.
  - You are about to drop the column `namaAyah` on the `MAtlet` table. All the data in the column will be lost.
  - You are about to drop the column `tinggiBadan` on the `MAtlet` table. All the data in the column will be lost.
  - You are about to drop the column `uidProvinsi` on the `MAtlet` table. All the data in the column will be lost.
  - The `statusAtlet` column on the `MAtlet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `asalKlubNasional` on the `MPelatih` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `MPelatih` table. All the data in the column will be lost.
  - You are about to drop the column `mantanAtletNasional` on the `MPelatih` table. All the data in the column will be lost.
  - You are about to drop the column `mantanPelatnas` on the `MPelatih` table. All the data in the column will be lost.
  - You are about to drop the column `tahunPelatnas` on the `MPelatih` table. All the data in the column will be lost.
  - You are about to drop the column `emailSentTime` on the `MUser` table. All the data in the column will be lost.
  - You are about to drop the column `hasEmailSent` on the `MUser` table. All the data in the column will be lost.
  - You are about to drop the `RAtletSektor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[uidOfficial]` on the table `MUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `klubSaatIni` to the `MAtlet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinsi` to the `MAtlet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusAkun" AS ENUM ('Aktif', 'Nonaktif');

-- CreateEnum
CREATE TYPE "StatusAktivitas" AS ENUM ('Aktif', 'Nonaktif');

-- AlterEnum
ALTER TYPE "RoleUser" ADD VALUE 'Official';

-- DropForeignKey
ALTER TABLE "RAtletSektor" DROP CONSTRAINT "RAtletSektor_uidAtlet_fkey";

-- DropForeignKey
ALTER TABLE "RAtletSektor" DROP CONSTRAINT "RAtletSektor_uidSektor_fkey";

-- DropIndex
DROP INDEX "MAtlet_email_key";

-- DropIndex
DROP INDEX "MAtlet_idPbsi_key";

-- DropIndex
DROP INDEX "MAtlet_nik_key";

-- DropIndex
DROP INDEX "MPelatih_email_key";

-- DropIndex
DROP INDEX "MPelatih_nik_key";

-- DropIndex
DROP INDEX "MUser_email_key";

-- DropIndex
DROP INDEX "RPelatihJenis_uidPelatih_jenisPelatih_deletedAt_key";

-- DropIndex
DROP INDEX "RPelatihSektor_uidPelatih_uidSektor_deletedAt_key";

-- AlterTable
ALTER TABLE "MAtlet" DROP COLUMN "beratBadan",
DROP COLUMN "email",
DROP COLUMN "namaAyah",
DROP COLUMN "tinggiBadan",
DROP COLUMN "uidProvinsi",
ADD COLUMN     "asalKlubSebelumnya" VARCHAR(100),
ADD COLUMN     "fileAkteKelahiran" VARCHAR(255),
ADD COLUMN     "fileKk" VARCHAR(255),
ADD COLUMN     "fileNisnOnline" VARCHAR(255),
ADD COLUMN     "fileSttbSd" VARCHAR(255),
ADD COLUMN     "gabungJayaRayaPada" DATE,
ADD COLUMN     "gabungSatelitPada" DATE,
ADD COLUMN     "klubSaatIni" VARCHAR(100) NOT NULL,
ADD COLUMN     "provinsi" VARCHAR(100) NOT NULL,
DROP COLUMN "statusAtlet",
ADD COLUMN     "statusAtlet" "StatusAktivitas" NOT NULL DEFAULT 'Aktif';

-- AlterTable
ALTER TABLE "MPelatih" DROP COLUMN "asalKlubNasional",
DROP COLUMN "email",
DROP COLUMN "mantanAtletNasional",
DROP COLUMN "mantanPelatnas",
DROP COLUMN "tahunPelatnas",
ADD COLUMN     "fileSertifikasiBwf1" VARCHAR(255),
ADD COLUMN     "fileSertifikasiBwf2" VARCHAR(255),
ADD COLUMN     "fileSertifikasiKota" VARCHAR(255),
ADD COLUMN     "fileSertifikasiMasterOlahraga" VARCHAR(255),
ADD COLUMN     "fileSertifikasiNasional" VARCHAR(255),
ADD COLUMN     "fileSertifikasiProvinsi" VARCHAR(255),
ADD COLUMN     "fileSertifikasiSarjanaOlahraga" VARCHAR(255),
ADD COLUMN     "kewarganegaraan" VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
ADD COLUMN     "statusPelatih" "StatusAktivitas" NOT NULL DEFAULT 'Aktif',
ALTER COLUMN "pernahMelatihSebelumnya" SET DEFAULT false,
ALTER COLUMN "klubNegaraSebelumnya" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MUser" DROP COLUMN "emailSentTime",
DROP COLUMN "hasEmailSent",
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "statusAkun" "StatusAkun" NOT NULL DEFAULT 'Aktif',
ADD COLUMN     "uidOfficial" VARCHAR(36);

-- DropTable
DROP TABLE "RAtletSektor";

-- DropEnum
DROP TYPE "StatusAtlet";

-- DropEnum
DROP TYPE "StatusKlub";

-- DropEnum
DROP TYPE "StatusSektorAtlet";

-- CreateTable
CREATE TABLE "MOfficial" (
    "uidOfficial" VARCHAR(36) NOT NULL,
    "nik" VARCHAR(20) NOT NULL,
    "namaLengkap" VARCHAR(100) NOT NULL,
    "nomorTelp" VARCHAR(20) NOT NULL,
    "tempatLahir" VARCHAR(100) NOT NULL,
    "tanggalLahir" DATE NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "statusOfficial" "StatusAktivitas" NOT NULL DEFAULT 'Aktif',
    "foto" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "MOfficial_pkey" PRIMARY KEY ("uidOfficial")
);

-- CreateIndex
CREATE UNIQUE INDEX "MUser_uidOfficial_key" ON "MUser"("uidOfficial");

-- AddForeignKey
ALTER TABLE "MUser" ADD CONSTRAINT "MUser_uidOfficial_fkey" FOREIGN KEY ("uidOfficial") REFERENCES "MOfficial"("uidOfficial") ON DELETE SET NULL ON UPDATE CASCADE;
