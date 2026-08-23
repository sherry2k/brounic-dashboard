"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmployeeApprovalRow({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(action: "APPROVE" | "REJECT" | "SUSPEND") {
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
      <td className="px-4 py-3">{user.email}</td>
      <td className="px-4 py-3">{user.status}</td>
      <td className="px-4 py-3">{new Date(user.requestedAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 space-x-2">
        {user.status === "PENDING" && (
          <>
            <button
              disabled={loading}
              onClick={() => act("APPROVE")}
              className="text-green-700 underline text-sm"
            >
              Approve
            </button>
            <button
              disabled={loading}
              onClick={() => act("REJECT")}
              className="text-red-600 underline text-sm"
            >
              Reject
            </button>
          </>
        )}
        {user.status === "APPROVED" && (
          <button
            disabled={loading}
            onClick={() => act("SUSPEND")}
            className="text-gray-500 underline text-sm"
          >
            Suspend
          </button>
        )}
      </td>
    </tr>
  );
}
