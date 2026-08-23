import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "bg-brounic-light text-brounic-dark",
  DUE: "bg-brounic-accent/30 text-brounic-orange",
  OVERDUE: "bg-red-100 text-red-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default async function AMCContractDetailPage({ params }: { params: { id: string } }) {
  const contract = await prisma.aMCContract.findUnique({
    where: { id: params.id },
    include: {
      site: { include: { client: true } },
      visits: {
        include: { checklistItems: { include: { nonConformance: true } }, technician: true },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!contract) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium">
          {contract.site.client.name} — {contract.site.name}
        </h1>
        <p className="text-sm text-gray-500">
          {contract.contractStart.toLocaleDateString()} – {contract.contractEnd.toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contract.visits.map((v) => {
          const openIssues = v.checklistItems.filter(
            (i) => i.nonConformance && i.nonConformance.status !== "CLOSED"
          ).length;

          return (
            <div key={v.id} className="border rounded-lg bg-white p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{v.quarter}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[v.status]}`}>
                  {v.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">Due {v.dueDate.toLocaleDateString()}</div>
              <div className="text-sm text-gray-500">
                Technician: {v.technician?.name ?? "Unassigned"}
              </div>
              {openIssues > 0 && (
                <div className="text-sm text-red-600">{openIssues} open non-conformance</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
