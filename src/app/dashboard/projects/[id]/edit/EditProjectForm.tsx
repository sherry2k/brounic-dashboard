"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SHOP_DRAWING_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "NEEDS_REVIEW", label: "Needs Review" },
  { value: "APPROVED", label: "Approved" },
];

export default function EditProjectForm({ project }: { project: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    projectName: project.projectName ?? "",
    plotNo: project.plotNo ?? "",
    location: project.location ?? "",
    shopDrawingStatus: project.shopDrawingStatus ?? "NOT_STARTED",
    notes: project.notes ?? "",
    poNumber: project.poNumber ?? "",
    contractValue: project.contractValue?.toString() ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    router.push(`/dashboard/projects/${project.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project.projectName}"? This can't be undone.`)) return;
    setDeleting(true);

    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });

    setDeleting(false);

    if (!res.ok) {
      setError("Failed to delete project");
      return;
    }

    router.push("/dashboard/projects");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-medium text-brounic-black">Edit project</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white border border-gray-200 rounded-lg p-6"
      >
        <div>
          <label className="block text-sm mb-1 text-brounic-dark">Project name</label>
          <input
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Plot no.</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.plotNo}
              onChange={(e) => setForm({ ...form, plotNo: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Location</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-brounic-dark">Shop drawing status</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange bg-white"
            value={form.shopDrawingStatus}
            onChange={(e) => setForm({ ...form, shopDrawingStatus: e.target.value })}
          >
            {SHOP_DRAWING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-brounic-dark">Notes</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">PO number (optional)</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.poNumber}
              onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Contract value (optional)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.contractValue}
              onChange={(e) => setForm({ ...form, contractValue: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto text-sm text-red-600 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete project"}
          </button>
        </div>
      </form>
    </div>
  );
}
