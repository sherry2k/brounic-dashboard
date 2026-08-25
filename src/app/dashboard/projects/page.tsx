import { prisma } from "@/lib/prisma";
import ProjectsListClient from "./ProjectsListClient";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { progressItems: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  const serializable = projects.map((p) => ({
    ...p,
    contractDate: p.contractDate ? p.contractDate.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    progressItems: p.progressItems.map((i) => ({ ...i, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString() })),
  }));

  return <ProjectsListClient initialProjects={serializable} />;
}
