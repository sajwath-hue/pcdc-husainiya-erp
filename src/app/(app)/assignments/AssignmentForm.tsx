"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea, SubmitButton, FormError } from "@/components/ui/Form";
import { createAssignmentAction, type FormState } from "./actions";
import type { ClassRow, Subject, Teacher } from "@/lib/types";

const initialState: FormState = { error: null };

export function AssignmentForm({
  classes,
  subjects,
  teachers,
}: {
  classes: ClassRow[];
  subjects: Subject[];
  teachers: Teacher[];
}) {
  const [state, formAction] = useActionState(createAssignmentAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <Field label="Title">
        <Input name="title" required placeholder="Tajweed practice sheet" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Class">
          <Select name="class_id" required defaultValue="">
            <option value="" disabled>
              Select class
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subject">
          <Select name="subject_id" defaultValue="">
            <option value="">General</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Teacher">
          <Select name="teacher_id" defaultValue="">
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due date">
          <Input type="date" name="due_date" />
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" rows={3} placeholder="Instructions for students..." />
      </Field>
      <FormError error={state.error} />
      <SubmitButton>Add assignment</SubmitButton>
    </form>
  );
}
