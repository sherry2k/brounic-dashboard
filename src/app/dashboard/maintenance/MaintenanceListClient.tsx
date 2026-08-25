"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ExternalLink, Pencil, Trash2, Download } from "lucide-react";
import EditMaintenanceModal from "./EditMaintenanceModal";
import { downloadCSV } from "@/lib/csv";

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

export default function MaintenanceListClient({ initialJobs }: { initialJobs: any[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.jobName.toLowerCase().includes(q) ||
        (j.client ?? "").toLowerCase().includes(q) ||
        (j.location ?? "").toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const total = jobs.length;
  const active = jobs.filter((j) => j.overallStatus === "ACTIVE").length;

  function handleExport() {
    const headers = [
      "Job Name", "Client", "Plot No.", "Location", "Contract Date",
      "Job Type", "Status", "Contract Value", "Received", "Due", "Description",
    ];
    const rows = filtered.map((j) => {
      const due = j.contractValue != null ? Number(j.contractValue) - Number(j.receivedAmount || 0) : "";
      return [
        j.jobName, j.client || "", j.plotNo || "", j.location || "",
        j.contractDate ? new Date(j.contractDate).toLocaleDateString() : "",
        j.jobType, STATUS_LABELS[j.overallStatus],
        j.contractValue ?? "", j.receivedAmount ?? "", due, j.description || "",
      ];
    });
    downloadCSV(`brounic-maintenance-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this maintenance job? This can't be undone.")) return;
    const res = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    if (res.ok) setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  function handleUpdated(updated: any) {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? { ...j, ...updated } : j)));
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-brounic-black">Maintenance Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage maintenance projects. Details can be edited anytime after a project is
            added. Click any row to view details.
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
            onClick={() => router.push("/dashboard/maintenance/new")}
            className="flex items-center gap-1.5 bg-brounic-orange hover:bg-brounic-black text-white rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Maintenance Projects</div>
          <div className="text-2xl font-semibold text-brounic-black mt-1">{total}</div>
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
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j.id} onClick={() => setEditing(j)} className="border-t hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-brounic-black text-white text-xs font-medium flex items-center justify-center shrink-0">
                      {j.jobName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-brounic-black font-medium">{j.jobName}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{j.client || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{j.location || "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {j.contractDate ? new Date(j.contractDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[j.overallStatus]}`}>
                    {STATUS_LABELS[j.overallStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditing(j)}
                      className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-brounic-black hover:border-gray-300"
                      title="View / Edit"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={() => setEditing(j)}
                      className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-brounic-black hover:border-gray-300"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(j.id)}
                      className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  {search ? "No jobs match your search." : "No maintenance jobs yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditMaintenanceModal
          job={editing}
          onClose={() => setEditing(null)}
          onSaved={handleUpdated}
          onDeleted={(id: string) => {
            setJobs((prev) => prev.filter((j) => j.id !== id));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
