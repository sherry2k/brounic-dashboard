export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ProjectsListClient from "./ProjectsListClient";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      progressCategories: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serializable = projects.map((p) => ({
    ...p,
    contractDate: p.contractDate ? p.contractDate.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    progressCategories: p.progressCategories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      items: c.items.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      })),
    })),
  }));

  return <ProjectsListClient initialProjects={serializable} />;
}
