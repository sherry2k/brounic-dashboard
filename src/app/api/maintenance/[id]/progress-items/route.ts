import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROGRESS_ITEMS } from "@/lib/progress";

const addItemSchema = z.object({ label: z.string().min(1) });

// With a body { label }, adds one custom checklist item.
// With no body, idempotently seeds the default checklist (only if empty).
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
    const count = await prisma.maintenanceProgressItem.count({ where: { maintenanceJobId: params.id } });
    const item = await prisma.maintenanceProgressItem.create({
      data: { maintenanceJobId: params.id, label: parsed.data.label, order: count },
    });
    return NextResponse.json({ ok: true, item });
  }

  const existing = await prisma.maintenanceProgressItem.count({ where: { maintenanceJobId: params.id } });
  if (existing > 0) {
    const items = await prisma.maintenanceProgressItem.findMany({
      where: { maintenanceJobId: params.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ ok: true, alreadyExists: true, items });
  }

  await prisma.maintenanceProgressItem.createMany({
    data: DEFAULT_PROGRESS_ITEMS.map((label, i) => ({
      maintenanceJobId: params.id,
      label,
      order: i,
    })),
  });

  const items = await prisma.maintenanceProgressItem.findMany({
    where: { maintenanceJobId: params.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ ok: true, items });
}
