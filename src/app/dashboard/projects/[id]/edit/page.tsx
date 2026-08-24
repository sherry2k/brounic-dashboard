import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProjectForm from "./EditProjectForm";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  return <EditProjectForm project={project} />;
}
