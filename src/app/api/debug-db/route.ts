import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic route — safe to expose (no credentials shown),
// delete this file once the database mismatch is resolved.
export async function GET() {
  let hostname = "unknown";
  try {
    const raw = process.env.DATABASE_URL || "";
    const match = raw.match(/@([^/]+)\//);
    hostname = match ? match[1] : "could not parse";
  } catch {
    hostname = "error reading env";
  }

  let tableCheck: any = null;
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT to_regclass('public."ProjectProgressCategory"') as exists`
    );
    tableCheck = result;
  } catch (e: any) {
    tableCheck = { error: e.message };
  }

  let projectCount: any = null;
  try {
    projectCount = await prisma.project.count();
  } catch (e: any) {
    projectCount = { error: e.message };
  }

  return NextResponse.json({
    connectedHost: hostname,
    categoryTableCheck: tableCheck,
    projectCount,
  });
}