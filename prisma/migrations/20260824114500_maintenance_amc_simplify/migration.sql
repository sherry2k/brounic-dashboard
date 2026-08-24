/*
  Warnings:

  - Added the required column `projectName` to the `AMCContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobName` to the `MaintenanceJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AMCContract" DROP CONSTRAINT "AMCContract_siteId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceJob" DROP CONSTRAINT "MaintenanceJob_siteId_fkey";

-- AlterTable
ALTER TABLE "AMCContract" ADD COLUMN     "location" TEXT,
ADD COLUMN     "plotNo" TEXT,
ADD COLUMN     "projectName" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ALTER COLUMN "siteId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MaintenanceJob" ADD COLUMN     "jobName" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "plotNo" TEXT,
ALTER COLUMN "siteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MaintenanceJob" ADD CONSTRAINT "MaintenanceJob_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMCContract" ADD CONSTRAINT "AMCContract_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
