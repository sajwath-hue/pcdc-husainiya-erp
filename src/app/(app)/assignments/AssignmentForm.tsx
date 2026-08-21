"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea, SubmitButton, FormError } from "@/components/ui/Form";
import { createAssignmentAction, type FormState } from "./actions";
import type { ClassRow, Subject, Teacher } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

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
  const t = useDictionary();

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <Field label={t.assignments.titleLabel}>
        <Input name="title" required placeholder="Tajweed practice sheet" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.common.class}>
          <Select name="class_id" required defaultValue="">
            <option value="" disabled>
              {t.students.selectClassPlaceholder}
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.common.subject}>
          <Select name="subject_id" defaultValue="">
            <option value="">{t.studentTabs.generalSubject}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.common.teacher}>
          <Select name="teacher_id" defaultValue="">
            <option value="">{t.common.unassigned}</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.assignments.dueDate}>
          <Input type="date" name="due_date" />
        </Field>
      </div>
      <Field label={t.assignments.description}>
        <Textarea name="description" rows={3} placeholder={t.assignments.instructionsPlaceholder} />
      </Field>
      <FormError error={state.error} />
      <SubmitButton>{t.assignments.addAssignment}</SubmitButton>
    </form>
  );
}
