import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROGRESS_STRUCTURE } from "@/lib/progress";

const addItemSchema = z.object({ label: z.string().min(1), categoryId: z.string().min(1) });

async function getCategoriesWithItems(maintenanceJobId: string) {
  return prisma.maintenanceProgressCategory.findMany({
    where: { maintenanceJobId },
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
}

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
    const count = await prisma.maintenanceProgressItem.count({ where: { categoryId: parsed.data.categoryId } });
    const item = await prisma.maintenanceProgressItem.create({
      data: { categoryId: parsed.data.categoryId, label: parsed.data.label, order: count },
    });
    return NextResponse.json({ ok: true, item });
  }

  const existing = await prisma.maintenanceProgressCategory.count({ where: { maintenanceJobId: params.id } });
  if (existing > 0) {
    const categories = await getCategoriesWithItems(params.id);
    return NextResponse.json({ ok: true, alreadyExists: true, categories });
  }

  for (let i = 0; i < DEFAULT_PROGRESS_STRUCTURE.length; i++) {
    const { category, tasks } = DEFAULT_PROGRESS_STRUCTURE[i];
    await prisma.maintenanceProgressCategory.create({
      data: {
        maintenanceJobId: params.id,
        label: category,
        order: i,
        items: { create: tasks.map((label, j) => ({ label, order: j })) },
      },
    });
  }

  const categories = await getCategoriesWithItems(params.id);
  return NextResponse.json({ ok: true, categories });
}
