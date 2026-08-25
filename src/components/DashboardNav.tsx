"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "New projects" },
  { href: "/dashboard/maintenance", label: "Maintenance" },
  { href: "/dashboard/amc", label: "AMC" },
  { href: "/dashboard/account", label: "Change Password" },
];

export default function DashboardNav({
  role,
  email,
}: {
  role?: string;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <div>
        <div className="mb-8 px-2 flex items-center justify-between">
          <Logo variant="dark" size={36} />
          <button
            className="md:hidden text-gray-300 text-xl leading-none"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                  active
                    ? "bg-brounic-orange text-white"
                    : "text-gray-300 hover:bg-black/30 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {role === "ADMIN" && (
            <Link
              href="/admin/employees"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm rounded-md text-brounic-accent hover:bg-black/30 transition-colors"
            >
              Employee approvals
            </Link>
          )}
        </nav>
      </div>
      <div className="px-2 space-y-2">
        <div className="text-xs text-gray-500 truncate">{email}</div>
        <LogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden h-14 bg-brounic-dark flex items-center justify-between px-4 sticky top-0 z-30">
        <Logo variant="dark" size={28} />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-white text-2xl leading-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile overlay sidebar */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-brounic-dark px-4 py-6 flex flex-col justify-between">
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-brounic-dark px-4 py-6 flex-col justify-between shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
