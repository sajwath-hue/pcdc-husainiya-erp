"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth/session";

const LINKS = [
  { href: "/dashboard", ta: "கண்காணிப்பு பலகை", en: "Dashboard" },
  { href: "/loans", ta: "கடன்கள்", en: "Loans" },
  { href: "/loans/new", ta: "புதிய விண்ணப்பம்", en: "New Application" },
];

export function Nav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900 text-sm">ஹுசைனியா PCDC</span>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href || (link.href === "/loans" && pathname?.startsWith("/loans/") && pathname !== "/loans/new");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    active ? "bg-emerald-50 text-emerald-800 font-medium" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.ta} <span className="text-xs text-slate-400">/ {link.en}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">
            {user.name} <span className="text-xs text-slate-400">({user.role.replaceAll("_", " ")})</span>
          </span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-red-600">
            வெளியேறு / Logout
          </button>
        </div>
      </div>
    </header>
  );
}
