"use client";

import { useState } from "react";
import { Pencil, Trash2, Save, X, User, MapPin, CalendarDays, ChevronDown, ChevronRight, RefreshCcw, AlertTriangle } from "lucide-react";

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

const STATUS_DOT: Record<string, string> = {
  UPCOMING: "bg-brounic-orange",
  DUE: "bg-brounic-orange",
  OVERDUE: "bg-red-500",
  COMPLETED: "bg-green-500",
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
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 rounded-md px-3 py-2.5">
        <div className="w-7 h-7 rounded-md bg-brounic-black text-white text-[11px] font-medium flex items-center justify-center shrink-0">
          {visit.quarter}
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
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
          className="flex items-center gap-1 bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Save size={11} /> {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1 border border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-600"
        >
          <X size={11} /> Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-brounic-black text-white text-[11px] font-medium flex items-center justify-center shrink-0">
          {visit.quarter}
        </div>
        <span className="text-xs text-brounic-black">{new Date(visit.dueDate).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[visit.status]}`}>
          {STATUS_LABEL[visit.status]}
        </span>
        <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-brounic-black">
          <Pencil size={13} />
        </button>
        <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-600">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

const RENEWAL_WINDOW_DAYS = 30;

function getExpiryState(contractEnd: string) {
  const end = new Date(contractEnd);
  const daysLeft = Math.round((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { state: "expired" as const, daysLeft };
  if (daysLeft <= RENEWAL_WINDOW_DAYS) return { state: "due" as const, daysLeft };
  return { state: "ok" as const, daysLeft };
}

export default function AMCContractCard({
  contract,
  onEditContract,
  onDeleteContract,
  onVisitUpdated,
  onVisitDeleted,
  onRenewed,
}: {
  contract: any;
  onEditContract: () => void;
  onDeleteContract: () => void;
  onVisitUpdated: (v: any) => void;
  onVisitDeleted: (id: string) => void;
  onRenewed: (newContract: any, oldContractId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const expiry = getExpiryState(contract.contractEnd);

  async function handleRenew() {
    if (!confirm(`Create the next AMC period for "${contract.projectName}"? This starts a new contract with 4 fresh quarterly visits.`)) return;
    setRenewing(true);
    const res = await fetch(`/api/amc/${contract.id}/renew`, { method: "POST" });
    setRenewing(false);
    if (res.ok) {
      const { contract: newContract, oldContractId } = await res.json();
      onRenewed(newContract, oldContractId);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 min-w-0">
          {expanded ? (
            <ChevronDown size={16} className="text-gray-400 shrink-0" />
          ) : (
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-brounic-black truncate">{contract.projectName}</div>
            <div className="text-xs text-gray-400 truncate">
              {contract.client || "—"} · {contract.location || "—"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {contract.visits.map((v: any) => (
              <span
                key={v.id}
                title={`${v.quarter}: ${STATUS_LABEL[v.status]}`}
                className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[v.status]}`}
              />
            ))}
          </div>
          {contract.overallStatus !== "COMPLETED" && expiry.state === "expired" && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap bg-red-100 text-red-700">
              <AlertTriangle size={11} /> Contract Expired
            </span>
          )}
          {contract.overallStatus !== "COMPLETED" && expiry.state === "due" && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap bg-blue-100 text-blue-700">
              <RefreshCcw size={11} /> Waiting for Renewal
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${OVERALL_STATUS_BADGE[contract.overallStatus]}`}>
            {OVERALL_STATUS_LABEL[contract.overallStatus]}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
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
              Contract: {new Date(contract.contractStart).toLocaleDateString()} – {new Date(contract.contractEnd).toLocaleDateString()}
            </div>
            {contract.overallStatus !== "COMPLETED" && expiry.state === "expired" && (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <AlertTriangle size={14} className="shrink-0" />
                Expired {Math.abs(expiry.daysLeft)}d ago
              </div>
            )}
            {contract.overallStatus !== "COMPLETED" && expiry.state === "due" && (
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <RefreshCcw size={14} className="shrink-0" />
                Renewal due in {expiry.daysLeft}d
              </div>
            )}
          </div>

          <div className="space-y-2">
            {contract.visits.map((visit: any) => (
              <VisitRow key={visit.id} visit={visit} onUpdated={onVisitUpdated} onDeleted={onVisitDeleted} />
            ))}
          </div>

          {contract.overallStatus !== "COMPLETED" && expiry.state !== "ok" && (
            <button
              onClick={handleRenew}
              disabled={renewing}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCcw size={14} /> {renewing ? "Renewing..." : "Renew Contract"}
            </button>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={onEditContract}
              className="flex-1 flex items-center justify-center gap-2 bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              <Pencil size={14} /> Edit Contract
            </button>
            <button
              onClick={onDeleteContract}
              className="flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-600 hover:border-red-300 hover:text-red-600"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
