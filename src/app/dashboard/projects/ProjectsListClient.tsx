"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Search, Plus, ExternalLink, Pencil, Trash2, Download } from "lucide-react";
import EditProjectModal from "./EditProjectModal";
import { downloadCSV } from "@/lib/csv";
import { calculateOverallProgress } from "@/lib/progress";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-brounic-accent/30 text-brounic-orange",
  COMPLETED: "bg-green-100 text-green-700",
  ON_HOLD: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

const DRAWING_STYLES: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-brounic-accent/30 text-brounic-orange",
  NEEDS_REVIEW: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
};

const DRAWING_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  NEEDS_REVIEW: "Needs Review",
  APPROVED: "Approved",
};

function allItems(project: any) {
  return (project.progressCategories ?? []).flatMap((c: any) => c.items);
}

function progressOf(project: any) {
  return calculateOverallProgress(project.progressCategories ?? [], project.shopDrawingStatus);
}

export default function ProjectsListClient({ initialProjects }: { initialProjects: any[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showNewLink, setShowNewLink] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(q) ||
        (p.client ?? "").toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q)
    );
  }, [projects, search]);

  const total = projects.length;
  const active = projects.filter((p) => p.overallStatus === "ACTIVE").length;
  const avgProgress =
    total === 0 ? 0 : Math.round(projects.reduce((sum, p) => sum + progressOf(p), 0) / total);

  function handleExport() {
    const headers = [
      "Project Name", "Client", "Plot No.", "Location", "Contract Date",
      "Shop Drawing Status", "Status", "Progress %", "Contract Value",
      "Received", "Due", "Notes",
    ];
    const rows = filtered.map((p) => {
      const items = allItems(p);
      const total = items.length;
      const doneCount = items.filter((i: any) => i.completed).length;
      const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);
      const cv = p.contractValue ?? "";
      const ra = p.receivedAmount ?? "";
      const due = p.contractValue != null ? Number(p.contractValue) - Number(p.receivedAmount || 0) : "";
      return [
        p.projectName, p.client || "", p.plotNo || "", p.location || "",
        p.contractDate ? new Date(p.contractDate).toLocaleDateString() : "",
        DRAWING_LABELS[p.shopDrawingStatus], STATUS_LABELS[p.overallStatus], progress,
        cv, ra, due, p.notes || "",
      ];
    });
    downloadCSV(`brounic-projects-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  function handleUpdated(updated: any) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-brounic-black">Supply &amp; Installation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track FACP, PVC piping, device installation, fire pumps and more — progress rises as
            each task is ticked off. Click any row to view details in a popup.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange w-52"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:border-brounic-orange hover:text-brounic-orange rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => router.push("/dashboard/projects/new")}
            className="flex items-center gap-1.5 bg-brounic-orange hover:bg-brounic-black text-white rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Installation Projects</div>
          <div className="text-2xl font-semibold text-brounic-black mt-1">{total}</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Average Progress</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-semibold text-brounic-black">{avgProgress}%</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brounic-orange rounded-full" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Active</div>
          <div className="text-2xl font-semibold text-brounic-black mt-1">{active}</div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-normal">Project</th>
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Location</th>
              <th className="px-4 py-3 font-normal">Contract</th>
              <th className="px-4 py-3 font-normal">Shop Drawing</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Progress</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const progress = progressOf(p);
              const pItems = allItems(p);
              const doneCount = pItems.filter((i: any) => i.completed).length;
              return (
                <tr
                  key={p.id}
                  onClick={() => setEditing(p)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-brounic-black text-white text-xs font-medium flex items-center justify-center shrink-0">
                        {p.projectName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-brounic-black font-medium">{p.projectName}</div>
                        <div className="text-xs text-gray-400">
                          {doneCount}/{pItems.length} tasks
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.client || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{p.location || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.contractDate ? new Date(p.contractDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${DRAWING_STYLES[p.shopDrawingStatus]}`}>
                      {DRAWING_LABELS[p.shopDrawingStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[p.overallStatus]}`}>
                      {STATUS_LABELS[p.overallStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 w-32">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brounic-orange rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-9">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-brounic-black hover:border-gray-300"
                        title="View"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => setEditing(p)}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-brounic-black hover:border-gray-300"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  {search ? "No projects match your search." : "No projects yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditProjectModal project={editing} onClose={() => setEditing(null)} onSaved={handleUpdated} onDeleted={(id: string) => {
          setProjects((prev) => prev.filter((p) => p.id !== id));
          setEditing(null);
        }} />
      )}
    </div>
  );
}
