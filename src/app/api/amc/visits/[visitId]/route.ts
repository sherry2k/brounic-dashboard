import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const visitUpdateSchema = z.object({
  dueDate: z.coerce.date(),
  status: z.enum(["UPCOMING", "DUE", "OVERDUE", "COMPLETED"]),
});

export async function PATCH(req: Request, { params }: { params: { visitId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = visitUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { dueDate, status } = parsed.data;

  const visit = await prisma.aMCVisit.update({
    where: { id: params.visitId },
    data: {
      dueDate,
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, visit });
}

export async function DELETE(req: Request, { params }: { params: { visitId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.aMCVisit.delete({ where: { id: params.visitId } });

  return NextResponse.json({ ok: true });
}
