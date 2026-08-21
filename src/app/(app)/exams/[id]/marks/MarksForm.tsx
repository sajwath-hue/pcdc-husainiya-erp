"use client";

import { useActionState } from "react";
import { saveMarksAction, type MarksState } from "../../actions";
import { SubmitButton } from "@/components/ui/Form";
import { initials } from "@/lib/utils";
import type { Student } from "@/lib/types";
import { format } from "@/lib/i18n";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

const initialState: MarksState = { error: null, success: false };

export function MarksForm({
  examId,
  totalMarks,
  students,
  existing,
}: {
  examId: string;
  totalMarks: number;
  students: Student[];
  existing: Map<string, number>;
}) {
  const [state, formAction] = useActionState(saveMarksAction, initialState);
  const t = useDictionary();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="exam_id" value={examId} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t.common.student}</th>
              <th className="px-4 py-3">{t.attendance.rollNo}</th>
              <th className="px-4 py-3">{format(t.exams.marksObtainedOf, { total: totalMarks })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <input type="hidden" name="student_id" value={s.id} />
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {initials(s.full_name)}
                    </div>
                    {s.full_name}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{s.roll_no ?? "—"}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    name={`marks_${s.id}`}
                    min={0}
                    max={totalMarks}
                    step="0.5"
                    defaultValue={existing.get(s.id) ?? ""}
                    className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>{t.exams.saveMarks}</SubmitButton>
        {state.success && <span className="text-sm font-medium text-emerald-600">{t.exams.marksSaved}</span>}
        {state.error && <span className="text-sm font-medium text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
