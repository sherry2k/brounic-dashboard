import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROGRESS_STRUCTURE } from "@/lib/progress";

const maintenanceSchema = z.object({
  jobName: z.string().min(1),
  client: z.string().optional(),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  contractDate: z.coerce.date().optional(),
  overallStatus: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).default("ACTIVE"),
  shopDrawingStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "NEEDS_REVIEW", "APPROVED"]).default("NOT_STARTED"),
  jobType: z.enum(["REACTIVE", "SCHEDULED", "WARRANTY"]).default("REACTIVE"),
  description: z.string().min(1),
  contractValue: z.coerce.number().optional(),
  receivedAmount: z.coerce.number().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = maintenanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const {
    jobName, client, plotNo, location, contractDate, overallStatus, shopDrawingStatus, jobType,
    description, contractValue, receivedAmount,
  } = parsed.data;

  const job = await prisma.maintenanceJob.create({
    data: {
      jobName,
      client: client || null,
      plotNo: plotNo || null,
      location: location || null,
      contractDate: contractDate ?? null,
      overallStatus,
      shopDrawingStatus,
      jobType,
      description,
      status: "REPORTED",
      contractValue: contractValue ?? null,
      receivedAmount: receivedAmount ?? null,
      progressCategories: {
        create: DEFAULT_PROGRESS_STRUCTURE.map((cat, i) => ({
          label: cat.category,
          order: i,
          items: { create: cat.tasks.map((label, j) => ({ label, order: j })) },
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, job });
}
