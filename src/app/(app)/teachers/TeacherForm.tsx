"use client";

import { useActionState } from "react";
import { Field, Input, SubmitButton, FormError } from "@/components/ui/Form";
import { createTeacherAction, updateTeacherAction, type FormState } from "./actions";
import type { ClassRow, Subject, Teacher } from "@/lib/types";

const initialState: FormState = { error: null };

export function TeacherForm({
  teacher,
  subjects,
  classes,
  assignedSubjectIds = [],
  assignedClassIds = [],
}: {
  teacher?: Teacher;
  subjects: Subject[];
  classes: ClassRow[];
  assignedSubjectIds?: string[];
  assignedClassIds?: string[];
}) {
  const action = teacher ? updateTeacherAction : createTeacherAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {teacher && <input type="hidden" name="id" value={teacher.id} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input name="full_name" required defaultValue={teacher?.full_name} placeholder="Ahmed Raza" />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={teacher?.phone ?? ""} placeholder="0301 2345678" />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" defaultValue={teacher?.email ?? ""} placeholder="name@manbaulhuda.edu" />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Subjects</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {subjects.map((s) => (
            <label key={s.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="subject_ids"
                value={s.id}
                defaultChecked={assignedSubjectIds.includes(s.id)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              {s.name}
            </label>
          ))}
          {subjects.length === 0 && <p className="text-sm text-slate-400">Add subjects first from the Subjects page.</p>}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Assigned classes</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {classes.map((c) => (
            <label key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="class_ids"
                value={c.id}
                defaultChecked={assignedClassIds.includes(c.id)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              {c.class_name}
            </label>
          ))}
          {classes.length === 0 && <p className="text-sm text-slate-400">Add classes first from the Classes page.</p>}
        </div>
      </div>

      <FormError error={state.error} />
      <SubmitButton>{teacher ? "Save changes" : "Create teacher"}</SubmitButton>
    </form>
  );
}
