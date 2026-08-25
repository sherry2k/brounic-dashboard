"use client";

import { useEffect, useState } from "react";
import { X, Check, Plus, Trash2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
];

const JOB_TYPES = [
  { value: "REACTIVE", label: "Reactive (fault reported)" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "WARRANTY", label: "Warranty" },
];

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export default function EditMaintenanceModal({
  job,
  onClose,
  onSaved,
  onDeleted,
}: {
  job: any;
  onClose: () => void;
  onSaved: (j: any) => void;
  onDeleted: (id: string) => void;
}) {
  const [form, setForm] = useState({
    jobName: job.jobName ?? "",
    client: job.client ?? "",
    location: job.location ?? "",
    contractDate: toDateInputValue(job.contractDate),
    overallStatus: job.overallStatus ?? "ACTIVE",
    jobType: job.jobType ?? "REACTIVE",
    description: job.description ?? "",
    contractValue: job.contractValue?.toString() ?? "",
    receivedAmount: job.receivedAmount?.toString() ?? "",
  });
  const [items, setItems] = useState<any[]>(job.progressItems ?? []);
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      fetch(`/api/maintenance/${job.id}/progress-items`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.items) setItems(data.items);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = items.length;
  const done = items.filter((i) => i.completed).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  async function toggleItem(item: any) {
    const nextCompleted = !item.completed;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, completed: nextCompleted } : i)));
    await fetch(`/api/maintenance/${job.id}/progress-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: nextCompleted }),
    });
  }

  async function deleteItem(item: any) {
    if (!confirm(`Remove "${item.label}" from the checklist?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await fetch(`/api/maintenance/${job.id}/progress-items/${item.id}`, { method: "DELETE" });
  }

  async function addCustomTask() {
    if (!newTask.trim()) return;
    const res = await fetch(`/api/maintenance/${job.id}/progress-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newTask.trim() }),
    });
    if (res.ok) {
      const { item } = await res.json();
      setItems((prev) => [...prev, item]);
      setNewTask("");
    }
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/maintenance/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Something went wrong saving changes");
      return;
    }
    const { job: updated } = await res.json();
    onSaved({ ...updated, progressItems: items });
  }

  async function handleDelete() {
    if (!confirm(`Delete "${job.jobName}"? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/maintenance/${job.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) onDeleted(job.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg my-8 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brounic-black">Edit Maintenance Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-brounic-black">
            <X size={20} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Project Name
          </label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.jobName}
            onChange={(e) => setForm({ ...form, jobName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Client
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Location
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Contract Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.contractDate}
              onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange bg-white"
              value={form.overallStatus}
              onChange={(e) => setForm({ ...form, overallStatus: e.target.value })}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Job Type
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange bg-white"
            value={form.jobType}
            onChange={(e) => setForm({ ...form, jobType: e.target.value })}
          >
            {JOB_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Installation Tasks &amp; Progress
          </label>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brounic-orange rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-medium text-brounic-black w-10">{progress}%</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="w-full flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2.5 hover:border-gray-300"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      item.completed
                        ? "bg-brounic-orange border-brounic-orange text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {item.completed && <Check size={13} />}
                  </span>
                  <span className={`text-sm ${item.completed ? "line-through text-gray-400" : "text-brounic-black"}`}>
                    {item.label}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item)}
                  className="p-1 text-gray-300 hover:text-red-600 shrink-0"
                  title="Remove task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTask();
                }
              }}
              placeholder="Add a custom task..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            />
            <button
              type="button"
              onClick={addCustomTask}
              className="p-2 rounded-md bg-brounic-black hover:bg-brounic-orange text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Contract Value
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.contractValue}
              onChange={(e) => setForm({ ...form, contractValue: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Received
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.receivedAmount}
              onChange={(e) => setForm({ ...form, receivedAmount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Due
            </label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-600">
              {form.contractValue
                ? (Number(form.contractValue) - Number(form.receivedAmount || 0)).toLocaleString()
                : "—"}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete project"}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm text-gray-500">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
