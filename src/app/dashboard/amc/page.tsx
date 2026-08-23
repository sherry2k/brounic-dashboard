import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AMCPage() {
  const contracts = await prisma.aMCContract.findMany({
    include: { site: { include: { client: true } }, visits: true },
    orderBy: { contractEnd: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium">AMC contracts</h1>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-normal">Client / site</th>
              <th className="px-4 py-2 font-normal">Contract period</th>
              <th className="px-4 py-2 font-normal">Visits completed</th>
              <th className="px-4 py-2 font-normal">Overdue</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => {
              const completed = c.visits.filter((v) => v.status === "COMPLETED").length;
              const overdue = c.visits.filter((v) => v.status === "OVERDUE").length;
              return (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/amc/${c.id}`} className="underline">
                      {c.site.client.name} — {c.site.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {c.contractStart.toLocaleDateString()} – {c.contractEnd.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {completed}/{c.visitsPerYear}
                  </td>
                  <td className="px-4 py-3">{overdue > 0 ? overdue : "—"}</td>
                </tr>
              );
            })}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No AMC contracts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
