import Link from "next/link";
import { Search } from "lucide-react";
import { AcademicYearSwitcher } from "@/components/layout/AcademicYearSwitcher";
import { signOutAction } from "@/app/(app)/actions";
import type { AcademicYear } from "@/lib/types";

export function Topbar({
  years,
  selectedId,
}: {
  years: AcademicYear[];
  selectedId: string | null;
}) {
  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Search students, teachers, ID..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <AcademicYearSwitcher years={years} selectedId={selectedId} />
        <Link
          href="/change-password"
          className="hidden md:inline-block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Change Password
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
