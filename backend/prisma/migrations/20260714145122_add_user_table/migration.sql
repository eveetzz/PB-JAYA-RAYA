-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('Admin', 'Manajemen', 'pelatih_teknik', 'Atlet', 'pelatih_fisik');

-- CreateEnum
CREATE TYPE "StatusKlub" AS ENUM ('Induk', 'Afiliasi', 'Mitra');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "PeganganRaket" AS ENUM ('Kanan', 'Kiri');

-- CreateEnum
CREATE TYPE "StatusAtlet" AS ENUM ('Aktif', 'Cedera', 'Pensiun', 'Pelatnas');

-- CreateTable
CREATE TABLE "MUser" (
    "uidUser" VARCHAR(36) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "RoleUser" NOT NULL,
    "uidAtlet" VARCHAR(36),
    "uidPelatih" VARCHAR(36),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "MUser_pkey" PRIMARY KEY ("uidUser")
);

-- CreateTable
CREATE TABLE "MAtlet" (
    "uidAtlet" VARCHAR(36) NOT NULL,
    "namaLengkap" VARCHAR(100) NOT NULL,
    "namaAyah" VARCHAR(100) NOT NULL,
    "namaIbu" VARCHAR(100) NOT NULL,
    "tempatLahir" VARCHAR(100) NOT NULL,
    "tanggalLahir" DATE NOT NULL,
    "alamat" TEXT NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "peganganRaket" "PeganganRaket" NOT NULL,
    "tinggiBadan" INTEGER NOT NULL,
    "beratBadan" INTEGER NOT NULL,
    "statusAtlet" "StatusAtlet" NOT NULL,
    "foto" VARCHAR(255) NOT NULL,
    "uidProvinsi" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "MAtlet_pkey" PRIMARY KEY ("uidAtlet")
);

-- CreateTable
CREATE TABLE "MPelatih" (
    "uidPelatih" VARCHAR(36) NOT NULL,
    "namaLengkap" VARCHAR(100) NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "tanggalLahir" DATE NOT NULL,
    "tahunBergabung" INTEGER NOT NULL,
    "pernahMelatihSebelumnya" BOOLEAN NOT NULL,
    "klubNegaraSebelumnya" VARCHAR(100) NOT NULL,
    "mantanAtletNasional" BOOLEAN NOT NULL,
    "asalKlubNasional" VARCHAR(100) NOT NULL,
    "mantanPelatnas" BOOLEAN NOT NULL,
    "tahunPelatnas" INTEGER NOT NULL,
    "foto" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "MPelatih_pkey" PRIMARY KEY ("uidPelatih")
);

-- CreateIndex
CREATE UNIQUE INDEX "MUser_username_key" ON "MUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MUser_uidAtlet_key" ON "MUser"("uidAtlet");

-- CreateIndex
CREATE UNIQUE INDEX "MUser_uidPelatih_key" ON "MUser"("uidPelatih");

-- AddForeignKey
ALTER TABLE "MUser" ADD CONSTRAINT "MUser_uidAtlet_fkey" FOREIGN KEY ("uidAtlet") REFERENCES "MAtlet"("uidAtlet") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MUser" ADD CONSTRAINT "MUser_uidPelatih_fkey" FOREIGN KEY ("uidPelatih") REFERENCES "MPelatih"("uidPelatih") ON DELETE SET NULL ON UPDATE CASCADE;

-- Natural key aktif
CREATE UNIQUE INDEX uq_muser_email_active
ON "MUser" ("email")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX uq_matlet_nik_active
ON "MAtlet" ("nik")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX uq_matlet_idpbsi_active
ON "MAtlet" ("idPbsi")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX uq_mpelatih_nik_active
ON "MPelatih" ("nik")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX uq_mofficial_nik_active
ON "MOfficial" ("nik")
WHERE "deletedAt" IS NULL;

-- Assignment aktif: hanya satu yang endDate-nya null
CREATE UNIQUE INDEX uq_rpelatihjenis_active
ON "RPelatihJenis" ("uidPelatih", "jenisPelatih")
WHERE "deletedAt" IS NULL AND "endDate" IS NULL;

CREATE UNIQUE INDEX uq_rpelatihsektor_active
ON "RPelatihSektor" ("uidPelatih", "uidSektor")
WHERE "deletedAt" IS NULL AND "endDate" IS NULL;