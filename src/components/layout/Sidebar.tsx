"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";

export function Sidebar({
  fullName,
  role,
}: {
  fullName: string;
  role: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#0b1730] text-slate-300">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <GraduationCap size={22} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Manbaul Huda</p>
          <p className="text-xs text-slate-400">Arabic College</p>
        </div>
      </div>

      <div className="px-5 pb-2 pt-4 text-[11px] font-semibold tracking-wider text-slate-500">
        WORKSPACE
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={17} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {initials(fullName || "User")}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-medium text-white">{fullName}</p>
          <p className="text-xs capitalize text-slate-400">
            {role.replace("_", " ")}
          </p>
        </div>
      </div>
    </aside>
  );
}
