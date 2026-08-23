import { prisma } from "@/lib/prisma";

export default async function MaintenancePage() {
  const jobs = await prisma.maintenanceJob.findMany({
    include: { site: { include: { client: true } }, assignedTo: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium">Maintenance</h1>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-normal">Client / site</th>
              <th className="px-4 py-2 font-normal">Type</th>
              <th className="px-4 py-2 font-normal">Status</th>
              <th className="px-4 py-2 font-normal">Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  {j.site.client.name} — {j.site.name}
                </td>
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
