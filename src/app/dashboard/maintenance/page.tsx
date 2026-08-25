import { prisma } from "@/lib/prisma";
import MaintenanceListClient from "./MaintenanceListClient";

export default async function MaintenancePage() {
  const jobs = await prisma.maintenanceJob.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const serializable = jobs.map((j) => ({
    ...j,
    contractDate: j.contractDate ? j.contractDate.toISOString() : null,
    reportedAt: j.reportedAt.toISOString(),
    resolvedAt: j.resolvedAt ? j.resolvedAt.toISOString() : null,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  return <MaintenanceListClient initialJobs={serializable} />;
}
