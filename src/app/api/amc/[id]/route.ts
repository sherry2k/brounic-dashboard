import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const amcUpdateSchema = z.object({
  projectName: z.string().min(1),
  client: z.string().optional(),
  location: z.string().optional(),
  contractStart: z.coerce.date(),
  overallStatus: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]),
  projectId: z.string().nullable().optional(),
  remarks: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = amcUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { projectName, client, location, contractStart, overallStatus, projectId, remarks } = parsed.data;

  const contract = await prisma.aMCContract.update({
    where: { id: params.id },
    data: {
      projectName,
      client: client || null,
      location: location || null,
      contractStart,
      overallStatus,
      projectId: projectId || null,
      remarks: remarks || null,
    },
  });

  return NextResponse.json({ ok: true, contract });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.aMCContract.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
