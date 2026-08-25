"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import AMCContractCard from "./AMCContractCard";
import EditAMCModal from "./EditAMCModal";

export default function AMCListClient({
  initialContracts,
  projects,
}: {
  initialContracts: any[];
  projects: { id: string; projectName: string }[];
}) {
  const router = useRouter();
  const [contracts, setContracts] = useState(initialContracts);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contracts;
    return contracts.filter(
      (c) =>
        c.projectName.toLowerCase().includes(q) ||
        (c.client ?? "").toLowerCase().includes(q) ||
        (c.location ?? "").toLowerCase().includes(q)
    );
  }, [contracts, search]);

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.overallStatus === "ACTIVE").length;
  const totalVisitsDone = contracts.reduce(
    (sum, c) => sum + c.visits.filter((v: any) => v.status === "COMPLETED").length,
    0
  );
  const totalVisits = contracts.reduce((sum, c) => sum + c.visits.length, 0);

  function updateContractInPlace(updated: any) {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  }

  function updateVisitInPlace(contractId: string, visit: any) {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, visits: c.visits.map((v: any) => (v.id === visit.id ? { ...v, ...visit } : v)) }
          : c
      )
    );
  }

  function removeVisitInPlace(contractId: string, visitId: string) {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId ? { ...c, visits: c.visits.filter((v: any) => v.id !== visitId) } : c
      )
    );
  }

  function handleRenewed(newContract: any, oldContractId: string) {
    setContracts((prev) => {
      const updated = prev.map((c) =>
        c.id === oldContractId ? { ...c, overallStatus: "COMPLETED" } : c
      );
      return [
        {
          ...newContract,
          visits: newContract.visits.map((v: any) => ({
            ...v,
            dueDate: typeof v.dueDate === "string" ? v.dueDate : v.dueDate.toISOString?.() ?? v.dueDate,
          })),
        },
        ...updated,
      ];
    });
  }

  async function handleDeleteContract(id: string) {
    if (!confirm("Delete this AMC contract and all its visits? This can't be undone.")) return;
    const res = await fetch(`/api/amc/${id}`, { method: "DELETE" });
    if (res.ok) setContracts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-brounic-black">AMC Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage annual maintenance contracts and their scheduled visits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AMC..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange w-52"
            />
          </div>
          <button
            onClick={() => router.push("/dashboard/amc/new")}
            className="flex items-center gap-1.5 bg-brounic-orange hover:bg-brounic-black text-white rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> New AMC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">AMC Contracts</div>
          <div className="text-2xl font-semibold text-brounic-black mt-1">{totalContracts}</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Visits Done</div>
          <div className="text-2xl font-semibold text-brounic-black mt-1">
            {totalVisitsDone}/{totalVisits}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Active Contracts</div>
          <div className="text-2xl font-semibold text-brounic-black mt-1">{activeContracts}</div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((contract) => (
          <AMCContractCard
            key={contract.id}
            contract={contract}
            onEditContract={() => setEditing(contract)}
            onDeleteContract={() => handleDeleteContract(contract.id)}
            onVisitUpdated={(visit) => updateVisitInPlace(contract.id, visit)}
            onVisitDeleted={(visitId) => removeVisitInPlace(contract.id, visitId)}
            onRenewed={handleRenewed}
          />
        ))}
        {filtered.length === 0 && (
          <div className="border border-gray-200 rounded-lg bg-white p-6 text-center text-gray-400 text-sm">
            {search ? "No AMC contracts match your search." : "No AMC contracts yet."}
          </div>
        )}
      </div>

      {editing && (
        <EditAMCModal
          contract={editing}
          projects={projects}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            updateContractInPlace(updated);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
