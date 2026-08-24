import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const projectUpdateSchema = z.object({
  projectName: z.string().min(1),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  shopDrawingStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "NEEDS_REVIEW", "APPROVED"]),
  notes: z.string().optional(),
  poNumber: z.string().optional(),
  contractValue: z.coerce.number().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { projectName, plotNo, location, shopDrawingStatus, notes, poNumber, contractValue } = parsed.data;

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      projectName,
      plotNo: plotNo || null,
      location: location || null,
      shopDrawingStatus,
      notes: notes || null,
      poNumber: poNumber || null,
      contractValue: contractValue ?? null,
    },
  });

  return NextResponse.json({ ok: true, project });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.project.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
