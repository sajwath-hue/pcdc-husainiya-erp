"use client";

import { useState } from "react";
import { assignTeachersAction } from "../actions";
import type { Teacher } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function AssignTeachers({
  classId,
  allTeachers,
  assignedIds,
}: {
  classId: string;
  allTeachers: Teacher[];
  assignedIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const t = useDictionary();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        {t.classHub.manageTeacherAssignments}
      </button>
    );
  }

  return (
    <form action={assignTeachersAction} className="space-y-3">
      <input type="hidden" name="class_id" value={classId} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {allTeachers.map((teacher) => (
          <label
            key={teacher.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              name="teacher_ids"
              value={teacher.id}
              defaultChecked={assignedIds.includes(teacher.id)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            {teacher.full_name}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          onClick={() => setOpen(false)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t.classHub.saveAssignments}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}
