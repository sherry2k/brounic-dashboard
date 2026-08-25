"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MASTER_ADMIN_EMAIL } from "@/lib/constants";

export default function EmployeeApprovalRow({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isMaster = user.email === MASTER_ADMIN_EMAIL;

  async function act(action: "APPROVE" | "REJECT" | "SUSPEND" | "MAKE_ADMIN" | "REMOVE_ADMIN") {
    setLoading(true);
    await fetch(`/api/admin/employees/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="border-t">
      <td className="px-4 py-3">{user.name}</td>
      <td className="px-4 py-3">
        {user.email}
        {isMaster && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brounic-black text-white">Master</span>
        )}
      </td>
      <td className="px-4 py-3">
        {user.status}
        {user.role === "ADMIN" && <span className="ml-2 text-xs text-brounic-orange font-medium">Admin</span>}
      </td>
      <td className="px-4 py-3">{new Date(user.requestedAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 space-x-2 whitespace-nowrap">
        {user.status === "PENDING" && (
          <>
            <button disabled={loading} onClick={() => act("APPROVE")} className="text-green-700 underline text-sm">
              Approve
            </button>
            <button disabled={loading} onClick={() => act("REJECT")} className="text-red-600 underline text-sm">
              Reject
            </button>
          </>
        )}
        {user.status === "APPROVED" && (
          <>
            {user.role === "EMPLOYEE" && (
              <button disabled={loading} onClick={() => act("MAKE_ADMIN")} className="text-brounic-orange underline text-sm">
                Make Admin
              </button>
            )}
            {user.role === "ADMIN" && !isMaster && (
              <button disabled={loading} onClick={() => act("REMOVE_ADMIN")} className="text-gray-500 underline text-sm">
                Remove Admin
              </button>
            )}
            {!isMaster && (
              <button disabled={loading} onClick={() => act("SUSPEND")} className="text-gray-500 underline text-sm">
                Suspend
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
