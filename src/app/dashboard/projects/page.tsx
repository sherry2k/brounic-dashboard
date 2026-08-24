import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-brounic-accent/30 text-brounic-orange",
  NEEDS_REVIEW: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  NEEDS_REVIEW: "Needs Review",
  APPROVED: "Approved",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium text-brounic-black">New projects — supply & installation</h1>
        <Link
          href="/dashboard/projects/new"
          className="bg-brounic-orange hover:bg-brounic-black text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          + Add project
        </Link>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-normal">Project name</th>
              <th className="px-4 py-2 font-normal">Plot no.</th>
              <th className="px-4 py-2 font-normal">Location</th>
              <th className="px-4 py-2 font-normal">Shop drawing</th>
              <th className="px-4 py-2 font-normal">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/projects/${p.id}`} className="underline text-brounic-black">
                    {p.projectName}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.plotNo ?? "—"}</td>
                <td className="px-4 py-3">{p.location ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[p.shopDrawingStatus]}`}>
                    {STATUS_LABELS[p.shopDrawingStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">{p.updatedAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
