"use client";

import { useState } from "react";
import { promoteStudentAction } from "../actions";
import type { AcademicYear, ClassRow } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function PromoteStudent({
  studentId,
  years,
  classes,
  currentClassId,
  currentYearId,
}: {
  studentId: string;
  years: AcademicYear[];
  classes: ClassRow[];
  currentClassId: string | null;
  currentYearId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const t = useDictionary();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {t.students.promoteEnroll}
      </button>
    );
  }

  return (
    <form
      action={promoteStudentAction}
      onSubmit={() => setOpen(false)}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <input type="hidden" name="id" value={studentId} />
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">{t.classHub.academicYear}</label>
        <select name="academic_year_id" defaultValue={currentYearId ?? ""} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm">
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">{t.common.class}</label>
        <select name="class_id" defaultValue={currentClassId ?? ""} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm">
          <option value="" disabled>
            {t.students.selectClassPlaceholder}
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.class_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">{t.students.rollNoDot}</label>
        <input type="number" name="roll_no" min={1} className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm" />
      </div>
      <button type="submit" className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
        {t.common.save}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
        {t.common.cancel}
      </button>
    </form>
  );
}
