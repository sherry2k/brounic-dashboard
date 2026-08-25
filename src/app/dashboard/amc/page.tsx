export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import AMCListClient from "./AMCListClient";

export default async function AMCPage() {
  const [contracts, projects] = await Promise.all([
    prisma.aMCContract.findMany({
      include: { visits: { orderBy: { dueDate: "asc" } } },
      orderBy: { contractEnd: "asc" },
    }),
    prisma.project.findMany({ select: { id: true, projectName: true }, orderBy: { projectName: "asc" } }),
  ]);

  const serializable = contracts.map((c) => ({
    ...c,
    contractStart: c.contractStart.toISOString(),
    contractEnd: c.contractEnd.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    visits: c.visits.map((v) => ({
      ...v,
      dueDate: v.dueDate.toISOString(),
      completedAt: v.completedAt ? v.completedAt.toISOString() : null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    })),
  }));

  return <AMCListClient initialContracts={serializable} projects={projects} />;
}
