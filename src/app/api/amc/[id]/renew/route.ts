import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAMCContractWithVisits } from "@/lib/amc";

// Creates the next contract period (same project/client/location, starting
// where the old one ends) with 4 fresh quarterly visits, and marks the old
// contract Completed since it's now superseded.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const old = await prisma.aMCContract.findUnique({ where: { id: params.id } });
  if (!old) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const newStart = old.contractEnd > new Date() ? old.contractEnd : new Date();
  const newEnd = new Date(newStart);
  newEnd.setFullYear(newEnd.getFullYear() + 1);

  const renewed = await createAMCContractWithVisits({
    projectName: old.projectName,
    client: old.client ?? undefined,
    plotNo: old.plotNo ?? undefined,
    location: old.location ?? undefined,
    contractValue: old.contractValue ?? undefined,
    contractStart: newStart,
    contractEnd: newEnd,
  });

  await prisma.aMCContract.update({
    where: { id: old.id },
    data: { overallStatus: "COMPLETED" },
  });

  return NextResponse.json({ ok: true, contract: renewed, oldContractId: old.id });
}
