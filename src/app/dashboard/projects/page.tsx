import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { site: { include: { client: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">New projects — supply &amp; installation</h1>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-normal">Client / site</th>
              <th className="px-4 py-2 font-normal">PO number</th>
              <th className="px-4 py-2 font-normal">Stage</th>
              <th className="px-4 py-2 font-normal">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/projects/${p.id}`} className="underline">
                    {p.site.client.name} — {p.site.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.poNumber ?? "—"}</td>
                <td className="px-4 py-3">{p.stage.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{p.updatedAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
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
