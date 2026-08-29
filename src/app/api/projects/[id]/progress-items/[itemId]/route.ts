import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  completed: z.boolean().optional(),
  label: z.string().min(1).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const item = await prisma.projectProgressItem.update({
    where: { id: params.itemId },
    data: {
      ...(parsed.data.completed !== undefined ? { completed: parsed.data.completed } : {}),
      ...(parsed.data.label !== undefined ? { label: parsed.data.label } : {}),
    },
  });

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.projectProgressItem.delete({ where: { id: params.itemId } });

  return NextResponse.json({ ok: true });
}
