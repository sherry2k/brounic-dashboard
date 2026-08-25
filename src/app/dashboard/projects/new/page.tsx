"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SHOP_DRAWING_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "NEEDS_REVIEW", label: "Needs Review" },
  { value: "APPROVED", label: "Approved" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    projectName: "",
    client: "",
    plotNo: "",
    location: "",
    contractDate: "",
    shopDrawingStatus: "NOT_STARTED",
    notes: "",
    poNumber: "",
    contractValue: "",
    receivedAmount: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    const { project } = await res.json();
    router.push(`/dashboard/projects/${project.id}`);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-medium text-brounic-black">Add new project</h1>
        <p className="text-sm text-gray-500 mt-1">
          New project — supply &amp; installation. Starts at the Quotation stage.
        </p>
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
            placeholder="e.g. One Pice Transport Gen. Contracting"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Client</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="e.g. Mr Mohamed"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Contract date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.contractDate}
              onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Plot no.</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.plotNo}
              onChange={(e) => setForm({ ...form, plotNo: e.target.value })}
              placeholder="e.g. T1003"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Location</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Ghyathi"
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
            placeholder="Progress notes — e.g. FACP installations done, PVC piping & cabling in progress..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Received amount (optional)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.receivedAmount}
              onChange={(e) => setForm({ ...form, receivedAmount: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create project"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
