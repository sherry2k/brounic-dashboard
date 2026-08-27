import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic route — delete once resolved.
export async function GET() {
  let hostname = "unknown";
  try {
    const raw = process.env.DATABASE_URL || "";
    const match = raw.match(/@([^/]+)\//);
    hostname = match ? match[1] : "could not parse";
  } catch {
    hostname = "error reading env";
  }

  const results: any = { connectedHost: hostname };

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

  try {
    results.maintenanceCategoryCount = await prisma.maintenanceProgressCategory.count();
  } catch (e: any) {
    results.maintenanceCategoryCount = { error: e.message };
  }

  try {
    const firstProject = await prisma.project.findFirst({
      include: { progressCategories: true },
    });
    results.sampleProjectWithCategories = firstProject
      ? { id: firstProject.id, name: firstProject.projectName, categoryCount: firstProject.progressCategories.length }
      : "no projects";
  } catch (e: any) {
    results.sampleProjectWithCategories = { error: e.message };
  }

  return NextResponse.json(results);
}