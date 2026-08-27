import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const raw = process.env.DATABASE_URL || "";
  const directRaw = process.env.DIRECT_URL || "";

  function parse(url: string) {
    try {
      const u = new URL(url);
      return {
        host: u.hostname,
        database: u.pathname.replace("/", ""),
        params: u.search,
        username: u.username,
      };
    } catch (e: any) {
      return { parseError: e.message, rawStart: url.slice(0, 15) };
    }
  }

  const results: any = {
    parsedDatabaseUrl: parse(raw),
    parsedDirectUrl: parse(directRaw),
  };

  try {
    const dbInfo: any = await prisma.$queryRawUnsafe(
      `SELECT current_database() as db, current_schema() as schema`
    );
    results.liveConnectionInfo = dbInfo;
  } catch (e: any) {
    results.liveConnectionInfo = { error: e.message };
  }

  try {
    results.projectCount = await prisma.project.count();
  } catch (e: any) {
    results.projectCount = { error: e.message };
  }

  try {
    results.categoryCount = await prisma.projectProgressCategory.count();
  } catch (e: any) {
    results.categoryCount = { error: e.message };
  }

  return NextResponse.json(results);
}