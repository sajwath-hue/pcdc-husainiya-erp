"use client";

import { useState } from "react";
import { assignTeachersAction } from "../actions";
import type { Teacher } from "@/lib/types";

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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        Manage teacher assignments
      </button>
    );
  }

  return (
    <form action={assignTeachersAction} className="space-y-3">
      <input type="hidden" name="class_id" value={classId} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {allTeachers.map((t) => (
          <label
            key={t.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              name="teacher_ids"
              value={t.id}
              defaultChecked={assignedIds.includes(t.id)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            {t.full_name}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          onClick={() => setOpen(false)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Save assignments
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
