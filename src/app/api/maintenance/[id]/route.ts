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
  jobType: z.enum(["REACTIVE", "SCHEDULED", "WARRANTY"]).optional(),
  description: z.string().optional(),
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

  const { jobName, client, plotNo, location, contractDate, overallStatus, jobType, description } = parsed.data;

  const job = await prisma.maintenanceJob.update({
    where: { id: params.id },
    data: {
      jobName,
      client: client || null,
      plotNo: plotNo || null,
      location: location || null,
      contractDate: contractDate ?? null,
      overallStatus,
      ...(jobType ? { jobType } : {}),
      ...(description ? { description } : {}),
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
