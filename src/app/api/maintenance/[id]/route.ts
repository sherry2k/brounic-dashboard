import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const maintenanceUpdateSchema = z.object({
  jobName: z.string().min(1),
  client: z.string().optional(),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  contractDate: z.coerce.date().optional(),
  overallStatus: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]),
  shopDrawingStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "NEEDS_REVIEW", "APPROVED"]).optional(),
  jobType: z.enum(["REACTIVE", "SCHEDULED", "WARRANTY"]).optional(),
  description: z.string().optional(),
  contractValue: z.coerce.number().optional(),
  receivedAmount: z.coerce.number().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = maintenanceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const {
    jobName, client, plotNo, location, contractDate, overallStatus, shopDrawingStatus, jobType,
    description, contractValue, receivedAmount,
  } = parsed.data;

  const job = await prisma.maintenanceJob.update({
    where: { id: params.id },
    data: {
      jobName,
      client: client || null,
      plotNo: plotNo || null,
      location: location || null,
      contractDate: contractDate ?? null,
      overallStatus,
      ...(shopDrawingStatus ? { shopDrawingStatus } : {}),
      ...(jobType ? { jobType } : {}),
      ...(description ? { description } : {}),
      contractValue: contractValue ?? null,
      receivedAmount: receivedAmount ?? null,
    },
  });

  return NextResponse.json({ ok: true, job });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.maintenanceJob.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
