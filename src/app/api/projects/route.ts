import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const projectSchema = z.object({
  projectName: z.string().min(1),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  shopDrawingStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "NEEDS_REVIEW", "APPROVED"]).default("NOT_STARTED"),
  notes: z.string().optional(),
  poNumber: z.string().optional(),
  contractValue: z.coerce.number().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { projectName, plotNo, location, shopDrawingStatus, notes, poNumber, contractValue } = parsed.data;

  const project = await prisma.project.create({
    data: {
      projectName,
      plotNo: plotNo || null,
      location: location || null,
      shopDrawingStatus,
      notes: notes || null,
      poNumber: poNumber || null,
      contractValue: contractValue ?? null,
      stage: "QUOTATION",
      createdById: (session.user as any).id,
    },
  });

  return NextResponse.json({ ok: true, project });
}
