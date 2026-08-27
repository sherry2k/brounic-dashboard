"use client";

import { useEffect, useState } from "react";
import { X, Check, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
];

const DRAWING_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "NEEDS_REVIEW", label: "Needs Review" },
  { value: "APPROVED", label: "Approved" },
];

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function CategorySection({
  category,
  projectId,
  onItemsChanged,
}: {
  category: any;
  projectId: string;
  onItemsChanged: (categoryId: string, items: any[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newTask, setNewTask] = useState("");
  const items = category.items ?? [];
  const done = items.filter((i: any) => i.completed).length;

  async function toggleItem(item: any) {
    const nextCompleted = !item.completed;
    const updated = items.map((i: any) => (i.id === item.id ? { ...i, completed: nextCompleted } : i));
    onItemsChanged(category.id, updated);
    await fetch(`/api/projects/${projectId}/progress-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: nextCompleted }),
    });
  }

  async function deleteItem(item: any) {
    if (!confirm(`Remove "${item.label}"?`)) return;
    onItemsChanged(category.id, items.filter((i: any) => i.id !== item.id));
    await fetch(`/api/projects/${projectId}/progress-items/${item.id}`, { method: "DELETE" });
  }

  async function addTask() {
    if (!newTask.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/progress-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newTask.trim(), categoryId: category.id }),
    });
    if (res.ok) {
      const { item } = await res.json();
      onItemsChanged(category.id, [...items, item]);
      setNewTask("");
    }
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
          <span className="text-sm font-medium text-brounic-black">{category.label}</span>
        </div>
        <span className="text-xs text-gray-500">
          {items.length === 0 ? "No tasks" : `${done}/${items.length}`}
        </span>
      </button>

      {expanded && (
        <div className="p-3 space-y-2 bg-white">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="w-full flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 hover:border-gray-300"
            >
              <button type="button" onClick={() => toggleItem(item)} className="flex-1 flex items-center gap-3 text-left">
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                    item.completed ? "bg-brounic-orange border-brounic-orange text-white" : "border-gray-300"
                  }`}
                >
                  {item.completed && <Check size={13} />}
                </span>
                <span className={`text-sm ${item.completed ? "line-through text-gray-400" : "text-brounic-black"}`}>
                  {item.label}
                </span>
              </button>
              <button type="button" onClick={() => deleteItem(item)} className="p-1 text-gray-300 hover:text-red-600 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-gray-400 px-1">No tasks yet — add one below.</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTask();
                }
              }}
              placeholder="Add a task..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            />
            <button
              type="button"
              onClick={addTask}
              className="p-1.5 rounded-md bg-brounic-black hover:bg-brounic-orange text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditProjectModal({
  project,
  onClose,
  onSaved,
  onDeleted,
}: {
  project: any;
  onClose: () => void;
  onSaved: (p: any) => void;
  onDeleted: (id: string) => void;
}) {
  const [form, setForm] = useState({
    projectName: project.projectName ?? "",
    client: project.client ?? "",
    location: project.location ?? "",
    contractDate: toDateInputValue(project.contractDate),
    overallStatus: project.overallStatus ?? "ACTIVE",
    shopDrawingStatus: project.shopDrawingStatus ?? "NOT_STARTED",
    notes: project.notes ?? "",
    contractValue: project.contractValue?.toString() ?? "",
    receivedAmount: project.receivedAmount?.toString() ?? "",
  });
  const [categories, setCategories] = useState<any[]>(project.progressCategories ?? []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (categories.length === 0) {
      fetch(`/api/projects/${project.id}/progress-items`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) setCategories(data.categories);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleItemsChanged(categoryId: string, items: any[]) {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, items } : c)));
  }

  const allItems = categories.flatMap((c) => c.items ?? []);
  const total = allItems.length;
  const done = allItems.filter((i) => i.completed).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Something went wrong saving changes");
      return;
    }
    const { project: updated } = await res.json();
    onSaved({ ...updated, progressCategories: categories });
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project.projectName}"? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) onDeleted(project.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg my-8 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brounic-black">Edit Project</h2>
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
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Client</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contract Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.contractDate}
              onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange bg-white"
              value={form.overallStatus}
              onChange={(e) => setForm({ ...form, overallStatus: e.target.value })}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Shop Drawing Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange bg-white"
            value={form.shopDrawingStatus}
            onChange={(e) => setForm({ ...form, shopDrawingStatus: e.target.value })}
          >
            {DRAWING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {categories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                projectId={project.id}
                onItemsChanged={handleItemsChanged}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contract Value</label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.contractValue}
              onChange={(e) => setForm({ ...form, contractValue: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Received</label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.receivedAmount}
              onChange={(e) => setForm({ ...form, receivedAmount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Due</label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-600">
              {form.contractValue
                ? (Number(form.contractValue) - Number(form.receivedAmount || 0)).toLocaleString()
                : "—"}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</label>
          <textarea
            rows={3}
            placeholder="Additional details..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete project"}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm text-gray-500">Cancel</button>
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
