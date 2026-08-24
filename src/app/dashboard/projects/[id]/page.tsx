import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  NEEDS_REVIEW: "Needs Review",
  APPROVED: "Approved",
};

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { shopDrawings: { orderBy: { revision: "desc" } } },
  });

  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium text-brounic-black">{project.projectName}</h1>
          <p className="text-sm text-gray-500">
            Plot {project.plotNo ?? "—"} · {project.location ?? "—"} · PO {project.poNumber ?? "—"}
          </p>
        </div>
        <a
          href={`/dashboard/projects/${project.id}/edit`}
          className="shrink-0 bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
        >
          Edit
        </a>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-brounic-dark">Shop drawing status</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
          {STATUS_LABELS[project.shopDrawingStatus]}
        </div>
      </section>

      {project.notes && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-brounic-dark">Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm whitespace-pre-wrap">
            {project.notes}
          </div>
        </section>
      )}

      {project.shopDrawings.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-brounic-dark">Drawing revision history</h2>
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-normal">Drawing #</th>
                  <th className="px-4 py-2 font-normal">Rev</th>
                  <th className="px-4 py-2 font-normal">Status</th>
                  <th className="px-4 py-2 font-normal">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {project.shopDrawings.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-3">{d.drawingNumber}</td>
                    <td className="px-4 py-3">R{d.revision}</td>
                    <td className="px-4 py-3">{d.status.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3">
                      {d.submittedAt ? d.submittedAt.toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
