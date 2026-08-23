import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH { action: "APPROVE" | "REJECT" | "SUSPEND" }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { action } = await req.json();
  const statusMap: Record<string, "APPROVED" | "REJECTED" | "SUSPENDED"> = {
    APPROVE: "APPROVED",
    REJECT: "REJECTED",
    SUSPEND: "SUSPENDED",
  };

  const nextStatus = statusMap[action];
  if (!nextStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      status: nextStatus,
      reviewedAt: new Date(),
      reviewedById: (session.user as any).id,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
