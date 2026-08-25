import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MASTER_ADMIN_EMAIL } from "@/lib/constants";

// PATCH { action: "APPROVE" | "REJECT" | "SUSPEND" | "MAKE_ADMIN" | "REMOVE_ADMIN" }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { action } = await req.json();
  const isMaster = target.email === MASTER_ADMIN_EMAIL;

  // The master account can never be suspended, rejected, or stripped of
  // its admin role — by anyone, including other admins.
  if (isMaster && (action === "SUSPEND" || action === "REJECT" || action === "REMOVE_ADMIN")) {
    return NextResponse.json({ error: "The master account cannot be modified" }, { status: 403 });
  }

  if (action === "MAKE_ADMIN" || action === "REMOVE_ADMIN") {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role: action === "MAKE_ADMIN" ? "ADMIN" : "EMPLOYEE" },
    });
    return NextResponse.json({ ok: true, user: updated });
  }

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
