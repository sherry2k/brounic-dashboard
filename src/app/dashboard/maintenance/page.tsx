import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MaintenancePage() {
  const jobs = await prisma.maintenanceJob.findMany({
    include: { assignedTo: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium text-brounic-black">Maintenance</h1>
        <Link
          href="/dashboard/maintenance/new"
          className="bg-brounic-orange hover:bg-brounic-black text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          + Add job
        </Link>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-normal">Project / client</th>
              <th className="px-4 py-2 font-normal">Type</th>
              <th className="px-4 py-2 font-normal">Status</th>
              <th className="px-4 py-2 font-normal">Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{j.jobName}</td>
                <td className="px-4 py-3">{j.jobType}</td>
                <td className="px-4 py-3">{j.status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{j.assignedTo?.name ?? "Unassigned"}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No maintenance jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
