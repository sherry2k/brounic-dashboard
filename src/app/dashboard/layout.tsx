import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Logo from "@/components/Logo";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/projects", label: "New projects" },
    { href: "/dashboard/maintenance", label: "Maintenance" },
    { href: "/dashboard/amc", label: "AMC" },
  ];

  return (
    <div className="min-h-screen flex bg-brounic-light">
      <aside className="w-56 bg-brounic-black px-4 py-6 flex flex-col justify-between">
        <div>
          <div className="mb-8 px-2">
            <Logo variant="dark" size={36} />
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-brounic-dark hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {role === "ADMIN" && (
              <Link
                href="/admin/employees"
                className="block px-3 py-2 text-sm rounded-md text-brounic-accent hover:bg-brounic-dark transition-colors"
              >
                Employee approvals
              </Link>
            )}
          </nav>
        </div>
        <div className="px-2 text-xs text-gray-500">{session?.user?.email}</div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-8">
          <span className="text-sm text-brounic-dark font-medium">Project dashboard</span>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
