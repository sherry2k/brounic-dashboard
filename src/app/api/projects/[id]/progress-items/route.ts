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
    const count = await prisma.projectProgressItem.count({ where: { projectId: params.id } });
    const item = await prisma.projectProgressItem.create({
      data: { projectId: params.id, label: parsed.data.label, order: count },
    });
    return NextResponse.json({ ok: true, item });
  }

  const existing = await prisma.projectProgressItem.count({ where: { projectId: params.id } });
  if (existing > 0) {
    return NextResponse.json({ ok: true, alreadyExists: true });
  }

  await prisma.projectProgressItem.createMany({
    data: DEFAULT_PROGRESS_ITEMS.map((label, i) => ({
      projectId: params.id,
      label,
      order: i,
    })),
  });

  return NextResponse.json({ ok: true });
}
