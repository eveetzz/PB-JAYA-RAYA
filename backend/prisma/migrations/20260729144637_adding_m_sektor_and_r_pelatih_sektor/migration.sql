-- CreateTable
CREATE TABLE "MSektor" (
    "uidSektor" VARCHAR(36) NOT NULL,
    "namaSektor" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "MSektor_pkey" PRIMARY KEY ("uidSektor")
);

-- CreateTable
CREATE TABLE "RPelatihSektor" (
    "uidRelasi" VARCHAR(36) NOT NULL,
    "uidPelatih" VARCHAR(36) NOT NULL,
    "uidSektor" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "RPelatihSektor_pkey" PRIMARY KEY ("uidRelasi")
);

-- CreateIndex
CREATE UNIQUE INDEX "RPelatihSektor_uidPelatih_uidSektor_deletedAt_key" ON "RPelatihSektor"("uidPelatih", "uidSektor", "deletedAt");

-- AddForeignKey
ALTER TABLE "RPelatihSektor" ADD CONSTRAINT "RPelatihSektor_uidPelatih_fkey" FOREIGN KEY ("uidPelatih") REFERENCES "MPelatih"("uidPelatih") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RPelatihSektor" ADD CONSTRAINT "RPelatihSektor_uidSektor_fkey" FOREIGN KEY ("uidSektor") REFERENCES "MSektor"("uidSektor") ON DELETE RESTRICT ON UPDATE CASCADE;
