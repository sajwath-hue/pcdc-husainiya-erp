"use client";

import { useActionState, useState } from "react";
import { Upload } from "lucide-react";
import { importStudentsAction, type FormState } from "./actions";
import { SubmitButton, FormError } from "@/components/ui/Form";
import type { AcademicYear } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

const initialState: FormState = { error: null };

export function ImportStudents({ years, selectedYearId }: { years: AcademicYear[]; selectedYearId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(importStudentsAction, initialState);
  const t = useDictionary();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Upload size={15} /> {t.students.importStudents}
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{t.students.importStudentsFromCsv}</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
          {t.common.close}
        </button>
      </div>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.students.selectAcademicYear}</label>
          <select
            name="academic_year_id"
            defaultValue={selectedYearId ?? ""}
            required
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              {t.common.selectYear}
            </option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.year_label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">{t.students.csvFile}</label>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700"
          />
        </div>
        <SubmitButton>{t.common.import}</SubmitButton>
      </form>
      <p className="mt-2 text-xs text-slate-400">{t.students.csvColumnsHelp}</p>
      <div className="mt-2">
        <FormError error={state.error} />
      </div>
    </div>
  );
}
