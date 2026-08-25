import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MASTER_ADMIN_EMAIL } from "@/lib/constants";

const schema = z.object({ newPassword: z.string().min(8) });

// Admin-initiated password reset — for locked-out employees. The master
// account's password can only be changed by the master account itself,
// via self-service, not reset by another admin.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.email === MASTER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "The master account's password can only be changed by that account itself" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: params.id }, data: { passwordHash: newHash } });

  return NextResponse.json({ ok: true });
}
