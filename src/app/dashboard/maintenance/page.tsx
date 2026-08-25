export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import MaintenanceListClient from "./MaintenanceListClient";

export default async function MaintenancePage() {
  const jobs = await prisma.maintenanceJob.findMany({
    include: { progressItems: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  const serializable = jobs.map((j) => ({
    ...j,
    contractDate: j.contractDate ? j.contractDate.toISOString() : null,
    reportedAt: j.reportedAt.toISOString(),
    resolvedAt: j.resolvedAt ? j.resolvedAt.toISOString() : null,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    progressItems: j.progressItems.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
  }));

  return <MaintenanceListClient initialJobs={serializable} />;
}
