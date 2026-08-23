import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { site: { include: { client: true } }, shopDrawings: { orderBy: { revision: "desc" } } },
  });

  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium">
          {project.site.client.name} — {project.site.name}
        </h1>
        <p className="text-sm text-gray-500">
          Stage: {project.stage.replaceAll("_", " ")} · PO {project.poNumber ?? "—"}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-700">Shop drawings</h2>
        <div className="border rounded-lg bg-white overflow-hidden">
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
              {project.shopDrawings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    No drawings submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
