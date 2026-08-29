"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import EditAMCModal from "./amc/EditAMCModal";

function daysUntil(date: Date) {
  const diffMs = date.getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function relativeDue(date: Date) {
  const d = daysUntil(date);
  if (d === 0) return "Today";
  if (d < 0) return `${Math.abs(d)}d overdue`;
  return `In ${d}d`;
}

export default function UpcomingAMCVisits({
  visits,
  projects,
}: {
  visits: any[];
  projects: { id: string; projectName: string }[];
}) {
  const router = useRouter();
  const [editingContract, setEditingContract] = useState<any | null>(null);

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-brounic-black">Upcoming AMC Visits</h2>
        <Link href="/dashboard/amc" className="text-xs text-brounic-orange font-medium flex items-center gap-1">
          View all <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="space-y-1">
        {visits.map((v) => (
          <button
            key={v.id}
            onClick={() => setEditingContract(v.contract)}
            className="w-full flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-md text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-brounic-accent/20 flex items-center justify-center text-brounic-orange shrink-0">
                <Clock size={14} />
              </div>
              <div>
                <div className="text-sm font-medium text-brounic-black">
                  {v.contractName} · {v.quarter}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(v.dueDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap">
              {relativeDue(new Date(v.dueDate))}
            </span>
          </button>
        ))}
        {visits.length === 0 && (
          <div className="text-sm text-gray-400 py-4 text-center">No upcoming visits.</div>
        )}
      </div>

      {editingContract && (
        <EditAMCModal
          contract={editingContract}
          projects={projects}
          onClose={() => setEditingContract(null)}
          onSaved={() => {
            setEditingContract(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
