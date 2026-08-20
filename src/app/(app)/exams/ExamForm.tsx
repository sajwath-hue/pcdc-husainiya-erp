"use client";

import { useActionState } from "react";
import { Field, Input, Select, SubmitButton, FormError } from "@/components/ui/Form";
import { createExamAction, updateExamAction, type FormState } from "./actions";
import type { AcademicYear, ClassRow, Subject } from "@/lib/types";

const initialState: FormState = { error: null };

export function ExamForm({
  years,
  classes,
  subjects,
  selectedYearId,
  exam,
}: {
  years: AcademicYear[];
  classes: ClassRow[];
  subjects: Subject[];
  selectedYearId?: string | null;
  exam?: {
    id: string;
    academic_year_id: string;
    class_id: string;
    subject_id: string;
    name: string;
    term: string | null;
    exam_date: string | null;
    total_marks: number;
  };
}) {
  const action = exam ? updateExamAction : createExamAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {exam && <input type="hidden" name="id" value={exam.id} />}
      <Field label="Exam name" hint="e.g. Mid Term, Final Term, Class Test 1">
        <Input name="name" required defaultValue={exam?.name} placeholder="Mid Term" />
      </Field>
      <Field label="Academic year">
        <Select name="academic_year_id" required defaultValue={exam?.academic_year_id ?? selectedYearId ?? ""}>
          <option value="" disabled>
            Select academic year
          </option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Class">
          <Select name="class_id" required defaultValue={exam?.class_id ?? ""}>
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
          <Select name="subject_id" required defaultValue={exam?.subject_id ?? ""}>
            <option value="" disabled>
              Select subject
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Term">
          <Input name="term" defaultValue={exam?.term ?? ""} placeholder="Term 1" />
        </Field>
        <Field label="Exam date">
          <Input type="date" name="exam_date" defaultValue={exam?.exam_date ?? ""} />
        </Field>
      </div>
      <Field label="Total marks">
        <Input type="number" name="total_marks" min={1} defaultValue={exam?.total_marks ?? 100} />
      </Field>
      <FormError error={state.error} />
      <SubmitButton>{exam ? "Save changes" : "Create exam"}</SubmitButton>
    </form>
  );
}
