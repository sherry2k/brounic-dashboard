import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAMCContractWithVisits } from "@/lib/amc";

const amcSchema = z.object({
  projectName: z.string().min(1),
  plotNo: z.string().optional(),
  location: z.string().optional(),
  contractValue: z.coerce.number().optional(),
  contractStart: z.coerce.date(),
  remarks: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = amcSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { projectName, plotNo, location, contractValue, contractStart, remarks } = parsed.data;

  const contractEnd = new Date(contractStart);
  contractEnd.setFullYear(contractEnd.getFullYear() + 1);

  const contract = await createAMCContractWithVisits({
    projectName,
    plotNo,
    location,
    contractValue,
    contractStart,
    contractEnd,
    remarks,
  });

  return NextResponse.json({ ok: true, contract });
}
