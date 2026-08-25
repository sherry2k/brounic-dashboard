import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const projectUpdateSchema = z.object({
  projectName: z.string().min(1),
  client: z.string().optional(),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  contractDate: z.coerce.date().optional(),
  overallStatus: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]),
  shopDrawingStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "NEEDS_REVIEW", "APPROVED"]).optional(),
  notes: z.string().optional(),
  poNumber: z.string().optional(),
  contractValue: z.coerce.number().optional(),
  receivedAmount: z.coerce.number().optional(),
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

  const {
    projectName, client, plotNo, location, contractDate, overallStatus,
    shopDrawingStatus, notes, poNumber, contractValue, receivedAmount,
  } = parsed.data;

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      projectName,
      client: client || null,
      plotNo: plotNo || null,
      location: location || null,
      contractDate: contractDate ?? null,
      overallStatus,
      ...(shopDrawingStatus ? { shopDrawingStatus } : {}),
      notes: notes || null,
      poNumber: poNumber || null,
      contractValue: contractValue ?? null,
      receivedAmount: receivedAmount ?? null,
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
