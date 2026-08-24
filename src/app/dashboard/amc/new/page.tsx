"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAMCPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    projectName: "",
    plotNo: "",
    location: "",
    contractValue: "",
    contractStart: "",
    remarks: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/amc", {
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

    const { contract } = await res.json();
    router.push(`/dashboard/amc/${contract.id}`);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-medium text-brounic-black">Add AMC contract</h1>
        <p className="text-sm text-gray-500 mt-1">
          Creates the contract along with all 4 quarterly visits (Q1–Q4), each pre-loaded with the
          standard checklist.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">AMC contract date</label>
            <input
              required
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.contractStart}
              onChange={(e) => setForm({ ...form, contractStart: e.target.value })}
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

        <div>
          <label className="block text-sm mb-1 text-brounic-dark">Remarks (optional)</label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            placeholder="e.g. payment notes"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create AMC contract"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/amc")}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
