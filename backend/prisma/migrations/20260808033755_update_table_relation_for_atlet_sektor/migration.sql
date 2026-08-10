-- DropIndex
DROP INDEX "RAtletSektor_uidAtlet_uidSektor_deletedAt_key";

-- AlterTable
ALTER TABLE "RAtletSektor" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
