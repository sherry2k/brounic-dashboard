"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, X, User, MapPin, CalendarDays, RefreshCw } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  UPCOMING: "bg-brounic-accent/30 text-brounic-orange",
  DUE: "bg-brounic-accent/30 text-brounic-orange",
  OVERDUE: "bg-red-100 text-red-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: "Pending",
  DUE: "Pending",
  OVERDUE: "Overdue",
  COMPLETED: "Completed",
};

const OVERALL_STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-brounic-accent/30 text-brounic-orange",
  COMPLETED: "bg-green-100 text-green-700",
  ON_HOLD: "bg-gray-100 text-gray-600",
};

const OVERALL_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

const VISIT_STATUS_OPTIONS = [
  { value: "UPCOMING", label: "Pending" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "COMPLETED", label: "Completed" },
];

function toDateInputValue(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function VisitRow({
  visit,
  onUpdated,
  onDeleted,
}: {
  visit: any;
  onUpdated: (v: any) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [dueDate, setDueDate] = useState(toDateInputValue(visit.dueDate));
  const [status, setStatus] = useState(visit.status);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/amc/visits/${visit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate, status }),
    });
    setSaving(false);
    if (res.ok) {
      const { visit: updated } = await res.json();
      onUpdated(updated);
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete the ${visit.quarter} visit? This can't be undone.`)) return;
    const res = await fetch(`/api/amc/visits/${visit.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(visit.id);
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 rounded-md px-3 py-3">
        <div className="w-8 h-8 rounded-md bg-brounic-black text-white text-xs font-medium flex items-center justify-center shrink-0">
          {visit.quarter}
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
        >
          {VISIT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Save size={12} /> {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-600"
        >
          <X size={12} /> Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-brounic-black text-white text-xs font-medium flex items-center justify-center shrink-0">
          {visit.quarter}
        </div>
        <span className="text-sm text-brounic-black">{new Date(visit.dueDate).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[visit.status]}`}>
          {STATUS_LABEL[visit.status]}
        </span>
        <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-brounic-black">
          <Pencil size={14} />
        </button>
        <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function AMCContractCard({
  contract,
  onEditContract,
  onDeleteContract,
  onVisitUpdated,
  onVisitDeleted,
}: {
  contract: any;
  onEditContract: () => void;
  onDeleteContract: () => void;
  onVisitUpdated: (v: any) => void;
  onVisitDeleted: (id: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5 space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-brounic-black">{contract.projectName}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${OVERALL_STATUS_BADGE[contract.overallStatus]}`}>
          {OVERALL_STATUS_LABEL[contract.overallStatus]}
        </span>
      </div>

      <div className="space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <User size={14} className="text-brounic-orange shrink-0" />
          {contract.client || "—"}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-brounic-orange shrink-0" />
          {contract.location || "—"}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-brounic-orange shrink-0" />
          Contract: {new Date(contract.contractStart).toLocaleDateString()}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide mb-2">
          <RefreshCw size={12} /> {contract.visits.length} Annual Visits
        </div>
        <div className="space-y-2">
          {contract.visits.map((visit: any) => (
            <VisitRow key={visit.id} visit={visit} onUpdated={onVisitUpdated} onDeleted={onVisitDeleted} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={onEditContract}
          className="flex-1 flex items-center justify-center gap-2 bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Pencil size={14} /> Edit Contract
        </button>
        <button
          onClick={onDeleteContract}
          className="flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-600 hover:border-red-300 hover:text-red-600"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}
