-- AlterTable
ALTER TABLE "MUser" ADD COLUMN     "emailSentTime" TIMESTAMP(3),
ADD COLUMN     "hasEmailSent" BOOLEAN NOT NULL DEFAULT false;
