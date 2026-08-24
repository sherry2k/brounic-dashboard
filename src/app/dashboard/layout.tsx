import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brounic-light">
      <DashboardNav role={role} email={session?.user?.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-14 bg-white border-b border-gray-200 items-center px-8">
          <span className="text-sm text-brounic-dark font-medium">Project dashboard</span>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
