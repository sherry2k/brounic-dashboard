import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmployeeApprovalRow from "@/components/EmployeeApprovalRow";
import { MASTER_ADMIN_EMAIL } from "@/lib/constants";

export default async function EmployeeApprovalsPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  const isMasterViewing = session?.user?.email === MASTER_ADMIN_EMAIL;

  const users = await prisma.user.findMany({
    where: {
      status: { in: ["PENDING", "APPROVED", "SUSPENDED"] },
      // Hide the master account from every admin except the master itself
      ...(isMasterViewing ? {} : { email: { not: MASTER_ADMIN_EMAIL } }),
    },
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium">Employee approvals</h1>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-normal">Name</th>
              <th className="px-4 py-2 font-normal">Email</th>
              <th className="px-4 py-2 font-normal">Status</th>
              <th className="px-4 py-2 font-normal">Requested</th>
              <th className="px-4 py-2 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <EmployeeApprovalRow key={u.id} user={u} />
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No employee requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
