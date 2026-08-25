-- CreateEnum
CREATE TYPE "OverallStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ON_HOLD');

-- DropForeignKey
ALTER TABLE "AMCVisit" DROP CONSTRAINT "AMCVisit_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_visitId_fkey";

-- DropForeignKey
ALTER TABLE "NonConformance" DROP CONSTRAINT "NonConformance_checklistItemId_fkey";

-- DropForeignKey
ALTER TABLE "ShopDrawing" DROP CONSTRAINT "ShopDrawing_projectId_fkey";

-- AlterTable
ALTER TABLE "AMCContract" ADD COLUMN     "client" TEXT,
ADD COLUMN     "overallStatus" "OverallStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "MaintenanceJob" ADD COLUMN     "client" TEXT,
ADD COLUMN     "contractDate" TIMESTAMP(3),
ADD COLUMN     "overallStatus" "OverallStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "client" TEXT,
ADD COLUMN     "contractDate" TIMESTAMP(3),
ADD COLUMN     "overallStatus" "OverallStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "ProjectProgressItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectProgressItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShopDrawing" ADD CONSTRAINT "ShopDrawing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProgressItem" ADD CONSTRAINT "ProjectProgressItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMCVisit" ADD CONSTRAINT "AMCVisit_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "AMCContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "AMCVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformance" ADD CONSTRAINT "NonConformance_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
