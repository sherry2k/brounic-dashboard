-- AlterTable
ALTER TABLE "MaintenanceJob" ADD COLUMN     "contractValue" DOUBLE PRECISION,
ADD COLUMN     "receivedAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "receivedAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "MaintenanceProgressItem" (
    "id" TEXT NOT NULL,
    "maintenanceJobId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceProgressItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintenanceProgressItem" ADD CONSTRAINT "MaintenanceProgressItem_maintenanceJobId_fkey" FOREIGN KEY ("maintenanceJobId") REFERENCES "MaintenanceJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
