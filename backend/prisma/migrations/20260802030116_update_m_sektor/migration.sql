/*
  Warnings:

  - A unique constraint covering the columns `[uidPelatih,jenisPelatih,deletedAt]` on the table `RPelatihJenis` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kategori` to the `MSektor` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `jenisPelatih` on the `RPelatihJenis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "JenisPelatih" AS ENUM ('pelatih_teknik', 'pelatih_fisik');

-- CreateEnum
CREATE TYPE "KategoriSektor" AS ENUM ('Fisik', 'Teknik');

-- DropIndex
DROP INDEX "RPelatihJenis_uidPelatih_key";

-- DropIndex
DROP INDEX "RPelatihSektor_uidPelatih_key";

-- DropIndex
DROP INDEX "RPelatihSektor_uidSektor_key";

-- AlterTable
ALTER TABLE "MSektor" ADD COLUMN     "kategori" "KategoriSektor" NOT NULL;

-- AlterTable
ALTER TABLE "RPelatihJenis" DROP COLUMN "jenisPelatih",
ADD COLUMN     "jenisPelatih" "JenisPelatih" NOT NULL;

-- DropEnum
DROP TYPE "jenisPelatih";

-- CreateIndex
CREATE UNIQUE INDEX "RPelatihJenis_uidPelatih_jenisPelatih_deletedAt_key" ON "RPelatihJenis"("uidPelatih", "jenisPelatih", "deletedAt");
