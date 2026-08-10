-- CreateEnum
CREATE TYPE "StatusSektorAtlet" AS ENUM ('Utama', 'Sekunder');

-- CreateTable
CREATE TABLE "RAtletSektor" (
    "uidRelasi" VARCHAR(36) NOT NULL,
    "uidAtlet" VARCHAR(36) NOT NULL,
    "uidSektor" VARCHAR(36) NOT NULL,
    "statusSektor" "StatusSektorAtlet" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" VARCHAR(36) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL,
    "deletedBy" VARCHAR(36),

    CONSTRAINT "RAtletSektor_pkey" PRIMARY KEY ("uidRelasi")
);

-- CreateIndex
CREATE UNIQUE INDEX "RAtletSektor_uidAtlet_uidSektor_deletedAt_key" ON "RAtletSektor"("uidAtlet", "uidSektor", "deletedAt");

-- AddForeignKey
ALTER TABLE "RAtletSektor" ADD CONSTRAINT "RAtletSektor_uidAtlet_fkey" FOREIGN KEY ("uidAtlet") REFERENCES "MAtlet"("uidAtlet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAtletSektor" ADD CONSTRAINT "RAtletSektor_uidSektor_fkey" FOREIGN KEY ("uidSektor") REFERENCES "MSektor"("uidSektor") ON DELETE RESTRICT ON UPDATE CASCADE;
