import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROGRESS_STRUCTURE } from "@/lib/progress";

const projectSchema = z.object({
  projectName: z.string().min(1),
  client: z.string().optional(),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  contractDate: z.coerce.date().optional(),
  overallStatus: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).default("ACTIVE"),
  shopDrawingStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "NEEDS_REVIEW", "APPROVED"]).default("NOT_STARTED"),
  notes: z.string().optional(),
  poNumber: z.string().optional(),
  contractValue: z.coerce.number().optional(),
  receivedAmount: z.coerce.number().optional(),
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

  const {
    projectName, client, plotNo, location, contractDate, overallStatus,
    shopDrawingStatus, notes, poNumber, contractValue, receivedAmount,
  } = parsed.data;

  const project = await prisma.project.create({
    data: {
      projectName,
      client: client || null,
      plotNo: plotNo || null,
      location: location || null,
      contractDate: contractDate ?? null,
      overallStatus,
      shopDrawingStatus,
      notes: notes || null,
      poNumber: poNumber || null,
      contractValue: contractValue ?? null,
      receivedAmount: receivedAmount ?? null,
      stage: "QUOTATION",
      createdById: (session.user as any).id,
      progressCategories: {
        create: DEFAULT_PROGRESS_STRUCTURE.map((cat, i) => ({
          label: cat.category,
          order: i,
          items: { create: cat.tasks.map((label, j) => ({ label, order: j })) },
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, project });
}
