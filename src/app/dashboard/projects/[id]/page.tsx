import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  NEEDS_REVIEW: "Needs Review",
  APPROVED: "Approved",
};

const OVERALL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      shopDrawings: { orderBy: { revision: "desc" } },
      progressCategories: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!project) notFound();

  const allItems = project.progressCategories.flatMap((c) => c.items);
  const total = allItems.length;
  const done = allItems.filter((i) => i.completed).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium text-brounic-black">{project.projectName}</h1>
          <p className="text-sm text-gray-500">
            {project.client ?? "—"} · Plot {project.plotNo ?? "—"} · {project.location ?? "—"} ·{" "}
            {OVERALL_STATUS_LABELS[project.overallStatus]}
          </p>
        </div>
        <Link
          href="/dashboard/projects"
          className="shrink-0 bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
        >
          Back to list to edit
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-brounic-dark">Installation progress</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brounic-orange rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-medium text-brounic-black w-10">{progress}%</span>
          </div>

          {project.progressCategories.map((cat) => (
            <div key={cat.id}>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {cat.label} ({cat.items.filter((i) => i.completed).length}/{cat.items.length})
              </div>
              <ul className="text-sm space-y-1 pl-2">
                {cat.items.map((item) => (
                  <li key={item.id} className={item.completed ? "line-through text-gray-400" : "text-brounic-black"}>
                    {item.label}
                  </li>
                ))}
                {cat.items.length === 0 && <li className="text-gray-400 italic">No tasks yet</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

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
    </div>
  );
}
