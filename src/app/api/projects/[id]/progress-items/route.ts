import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROGRESS_STRUCTURE } from "@/lib/progress";

const addItemSchema = z.object({ label: z.string().min(1), categoryId: z.string().min(1) });

async function getCategoriesWithItems(projectId: string) {
  return prisma.projectProgressCategory.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
}

// With a body { label, categoryId }, adds one custom subtask to that category.
// With no body, idempotently seeds the default category/task structure (only if empty).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = addItemSchema.safeParse(body);

  if (parsed.success) {
    const count = await prisma.projectProgressItem.count({ where: { categoryId: parsed.data.categoryId } });
    const item = await prisma.projectProgressItem.create({
      data: { categoryId: parsed.data.categoryId, label: parsed.data.label, order: count },
    });
    await prisma.project.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
    return NextResponse.json({ ok: true, item });
  }

  const existing = await prisma.projectProgressCategory.count({ where: { projectId: params.id } });
  if (existing > 0) {
    const categories = await getCategoriesWithItems(params.id);
    return NextResponse.json({ ok: true, alreadyExists: true, categories });
  }

  for (let i = 0; i < DEFAULT_PROGRESS_STRUCTURE.length; i++) {
    const { category, tasks } = DEFAULT_PROGRESS_STRUCTURE[i];
    await prisma.projectProgressCategory.create({
      data: {
        projectId: params.id,
        label: category,
        order: i,
        items: { create: tasks.map((label, j) => ({ label, order: j })) },
      },
    });
  }

  const categories = await getCategoriesWithItems(params.id);
  return NextResponse.json({ ok: true, categories });
}
