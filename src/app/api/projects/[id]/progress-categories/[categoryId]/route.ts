import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; categoryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Cascade delete removes all items in this category too.
  await prisma.projectProgressCategory.delete({ where: { id: params.categoryId } });
  await prisma.project.update({ where: { id: params.id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
