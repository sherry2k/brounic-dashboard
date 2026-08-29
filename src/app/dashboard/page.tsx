export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateOverallProgress } from "@/lib/progress";
import { Boxes, Package, Wrench, CalendarCheck, ArrowUpRight } from "lucide-react";
import UpcomingAMCVisits from "./UpcomingAMCVisits";

export default async function DashboardOverview() {
  const [projects, maintenanceJobs, amcContracts] = await Promise.all([
    prisma.project.findMany({
      include: { progressCategories: { include: { items: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.maintenanceJob.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.aMCContract.findMany({ include: { visits: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.overallStatus === "ACTIVE").length;
  const doneProjects = projects.filter((p) => p.overallStatus === "COMPLETED").length;

  const projectProgress = (p: (typeof projects)[number]) =>
    calculateOverallProgress(p.progressCategories);
  const avgInstallProgress =
    totalProjects === 0 ? 0 : Math.round(projects.reduce((sum, p) => sum + projectProgress(p), 0) / totalProjects);

  const totalMaintenance = maintenanceJobs.length;
  const activeMaintenance = maintenanceJobs.filter((j) => j.overallStatus === "ACTIVE").length;

  const totalAMCContracts = amcContracts.length;
  const allVisits = amcContracts.flatMap((c) => c.visits);
  const visitsDone = allVisits.filter((v) => v.status === "COMPLETED").length;

  const now = Date.now();
  const upcomingVisits = amcContracts
    .flatMap((c) =>
      c.visits.map((v) => ({
        ...v,
        dueDate: v.dueDate.toISOString(),
        contractName: c.projectName,
        contract: {
          id: c.id,
          projectName: c.projectName,
          client: c.client,
          location: c.location,
          contractStart: c.contractStart.toISOString(),
          overallStatus: c.overallStatus,
          projectId: c.projectId,
          remarks: c.remarks,
        },
      }))
    )
    .filter((v) => v.status !== "COMPLETED")
    .sort((a, b) => Math.abs(new Date(a.dueDate).getTime() - now) - Math.abs(new Date(b.dueDate).getTime() - now))
    .slice(0, 4);

  const projectOptions = projects.map((p) => ({ id: p.id, projectName: p.projectName }));

  const recentProjects = [
    ...projects.map((p) => ({
      id: p.id,
      type: "SI" as const,
      name: p.projectName,
      subLabel: "Supply & Installation",
      date: p.contractDate ?? p.updatedAt,
      status: p.overallStatus,
      href: "/dashboard/projects",
    })),
    ...amcContracts.map((c) => ({
      id: c.id,
      type: "AMC" as const,
      name: c.projectName,
      subLabel: "AMC",
      date: c.contractStart,
      status: c.overallStatus,
      href: "/dashboard/amc",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brounic-black">Project Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor installations, maintenance jobs and annual AMC schedules at a glance.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Today</div>
          <div className="text-sm font-medium text-brounic-black">
            {today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/projects" className="border border-gray-200 rounded-lg bg-white p-4 hover:border-brounic-orange transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brounic-accent/20 flex items-center justify-center text-brounic-orange">
              <Boxes size={18} />
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-brounic-orange transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-brounic-black">{totalProjects}</div>
          <div className="text-sm text-gray-500">Total Projects</div>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-brounic-black text-white">{activeProjects} active</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{doneProjects} done</span>
          </div>
        </Link>

        <Link href="/dashboard/projects" className="border border-gray-200 rounded-lg bg-white p-4 hover:border-brounic-orange transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brounic-accent/20 flex items-center justify-center text-brounic-orange">
              <Package size={18} />
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-brounic-orange transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-brounic-black">{totalProjects}</div>
          <div className="text-sm text-gray-500 mb-2">Supply &amp; Installation</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brounic-orange rounded-full" style={{ width: `${avgInstallProgress}%` }} />
            </div>
            <span className="text-xs text-gray-500">{avgInstallProgress}%</span>
          </div>
        </Link>

        <Link href="/dashboard/maintenance" className="border border-gray-200 rounded-lg bg-white p-4 hover:border-brounic-orange transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brounic-black flex items-center justify-center text-white">
              <Wrench size={18} />
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-brounic-orange transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-brounic-black">{totalMaintenance}</div>
          <div className="text-sm text-gray-500">Maintenance Projects</div>
          <div className="text-xs text-gray-400 mt-2">Fully editable after creation</div>
        </Link>

        <Link href="/dashboard/amc" className="border border-gray-200 rounded-lg bg-white p-4 hover:border-brounic-orange transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brounic-black flex items-center justify-center text-white">
              <CalendarCheck size={18} />
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-brounic-orange transition-colors" />
          </div>
          <div className="text-2xl font-semibold text-brounic-black">{totalAMCContracts}</div>
          <div className="text-sm text-gray-500">AMC Contracts</div>
          <div className="text-xs text-gray-400 mt-2">
            {visitsDone}/{allVisits.length} annual visits done
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-brounic-black">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-xs text-brounic-orange font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {recentProjects.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-brounic-black text-white text-[10px] font-medium flex items-center justify-center shrink-0">
                    {item.type}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-brounic-black">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.subLabel} · {new Date(item.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brounic-accent/30 text-brounic-orange font-medium">
                  {item.status === "ACTIVE" ? "Active" : item.status === "COMPLETED" ? "Completed" : "On Hold"}
                </span>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <div className="text-sm text-gray-400 py-4 text-center">No projects yet.</div>
            )}
          </div>
        </div>

        <UpcomingAMCVisits visits={upcomingVisits} projects={projectOptions} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/amc" className="border border-gray-200 rounded-lg bg-white p-4 hover:border-brounic-orange transition-colors">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <CalendarCheck size={14} className="text-brounic-orange" /> Completed AMC Visits
          </div>
          <div className="text-2xl font-semibold text-brounic-black">{visitsDone}</div>
          <div className="text-xs text-gray-400 mt-1">of {allVisits.length} scheduled this year</div>
        </Link>
        <Link href="/dashboard/maintenance" className="border border-gray-200 rounded-lg bg-white p-4 hover:border-brounic-orange transition-colors">
          <div className="text-sm text-gray-500 mb-2">Maintenance Projects</div>
          <div className="text-2xl font-semibold text-brounic-black">{activeMaintenance}</div>
          <div className="text-xs text-gray-400 mt-1">currently in progress</div>
        </Link>
        <Link href="/dashboard/projects" className="border border-gray-200 rounded-lg bg-white p-4 hover:border-brounic-orange transition-colors">
          <div className="text-sm text-gray-500 mb-2">Supply &amp; Installation</div>
          <div className="text-2xl font-semibold text-brounic-black">{avgInstallProgress}%</div>
          <div className="text-xs text-gray-400 mt-1">average progress across projects</div>
        </Link>
      </div>
    </div>
  );
}
