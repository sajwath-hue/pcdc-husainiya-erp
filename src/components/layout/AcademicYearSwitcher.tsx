"use client";

import { usePathname } from "next/navigation";
import { setAcademicYearAction } from "@/app/(app)/actions";
import type { AcademicYear } from "@/lib/types";

export function AcademicYearSwitcher({
  years,
  selectedId,
}: {
  years: AcademicYear[];
  selectedId: string | null;
}) {
  const pathname = usePathname();

  if (years.length === 0) {
    return (
      <span className="hidden md:inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
        No academic years yet
      </span>
    );
  }

  return (
    <form action={setAcademicYearAction} className="hidden md:block">
      <input type="hidden" name="redirect_to" value={pathname} />
      <select
        name="academic_year_id"
        defaultValue={selectedId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
      >
        {years.map((y) => (
          <option key={y.id} value={y.id}>
            Academic Year {y.year_label}
          </option>
        ))}
      </select>
    </form>
  );
}
