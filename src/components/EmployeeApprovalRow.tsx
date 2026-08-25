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

  async function resetPassword() {
    const newPassword = window.prompt(`Set a new password for ${user.name} (min 8 characters):`);
    if (!newPassword) return;
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/employees/${user.id}/reset-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      alert(`Password updated for ${user.name}.`);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to reset password");
    }
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
            {!isMaster && (
              <button disabled={loading} onClick={resetPassword} className="text-brounic-dark underline text-sm">
                Reset Password
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
