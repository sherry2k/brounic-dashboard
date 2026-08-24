import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const maintenanceSchema = z.object({
  jobName: z.string().min(1),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  jobType: z.enum(["REACTIVE", "SCHEDULED", "WARRANTY"]).default("REACTIVE"),
  description: z.string().min(1),
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

  const { jobName, plotNo, location, jobType, description } = parsed.data;

  const job = await prisma.maintenanceJob.create({
    data: {
      jobName,
      plotNo: plotNo || null,
      location: location || null,
      jobType,
      description,
      status: "REPORTED",
    },
  });

  return NextResponse.json({ ok: true, job });
}
