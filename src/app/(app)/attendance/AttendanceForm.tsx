"use client";

import { useActionState } from "react";
import { saveAttendanceAction, type AttendanceState } from "./actions";
import { SubmitButton } from "@/components/ui/Form";
import { initials } from "@/lib/utils";
import type { Student } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

const initialState: AttendanceState = { error: null, success: false };

const STATUS_OPTIONS = [
  { value: "present", key: "present" as const, className: "peer-checked:bg-emerald-600 peer-checked:text-white" },
  { value: "absent", key: "absent" as const, className: "peer-checked:bg-red-600 peer-checked:text-white" },
  { value: "late", key: "late" as const, className: "peer-checked:bg-amber-600 peer-checked:text-white" },
  { value: "leave", key: "leave" as const, className: "peer-checked:bg-sky-600 peer-checked:text-white" },
];

export function AttendanceForm({
  classId,
  date,
  students,
  existing,
}: {
  classId: string;
  date: string;
  students: Student[];
  existing: Map<string, string>;
}) {
  const [state, formAction] = useActionState(saveAttendanceAction, initialState);
  const t = useDictionary();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="class_id" value={classId} />
      <input type="hidden" name="date" value={date} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t.common.student}</th>
              <th className="px-4 py-3">{t.attendance.rollNo}</th>
              <th className="px-4 py-3">{t.common.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => {
              const current = existing.get(s.id) ?? "present";
              return (
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
                    <div className="flex gap-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`status_${s.id}`}
                            value={opt.value}
                            defaultChecked={current === opt.value}
                            className="peer sr-only"
                          />
                          <span
                            className={`inline-block rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 ${opt.className}`}
                          >
                            {t.attendance[opt.key]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>{t.attendance.saveAttendance}</SubmitButton>
        {state.success && <span className="text-sm font-medium text-emerald-600">{t.attendance.attendanceSaved}</span>}
        {state.error && <span className="text-sm font-medium text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
