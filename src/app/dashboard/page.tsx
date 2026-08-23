import { prisma } from "@/lib/prisma";

export default async function DashboardOverview() {
  const thirtyDaysOut = new Date();
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

  const [visitsDueSoon, overdueVisits, openMaintenance, activeProjects] = await Promise.all([
    prisma.aMCVisit.count({
      where: { status: { in: ["UPCOMING", "DUE"] }, dueDate: { lte: thirtyDaysOut } },
    }),
    prisma.aMCVisit.count({ where: { status: "OVERDUE" } }),
    prisma.maintenanceJob.count({ where: { status: { not: "CLIENT_SIGNOFF" } } }),
    prisma.project.count({ where: { stage: { not: "COMPLETED" } } }),
  ]);

  const stats = [
    { label: "AMC visits due (30 days)", value: visitsDueSoon },
    { label: "Overdue AMC visits", value: overdueVisits },
    { label: "Open maintenance jobs", value: openMaintenance },
    { label: "Active new projects", value: activeProjects },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-gray-200 border-l-4 border-l-brounic-orange rounded-lg bg-white p-4">
            <div className="text-2xl font-medium text-brounic-black">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
