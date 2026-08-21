"use client";

import { useActionState } from "react";
import { Field, Input, Select, SubmitButton, FormError } from "@/components/ui/Form";
import { createFeeAction, type FormState } from "./actions";
import type { AcademicYear, Student } from "@/lib/types";

const initialState: FormState = { error: null };

const FEE_TYPES = ["Tuition", "Admission", "Exam", "Transport", "Hostel", "Other"];

export function FeeForm({
  students,
  years,
  selectedYearId,
  studentId,
}: {
  students: Student[];
  years: AcademicYear[];
  selectedYearId?: string | null;
  studentId?: string;
}) {
  const [state, formAction] = useActionState(createFeeAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <Field label="Student">
        <Select name="student_id" required defaultValue={studentId ?? ""}>
          <option value="" disabled>
            Select student
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.student_id})
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Academic year">
        <Select name="academic_year_id" required defaultValue={selectedYearId ?? ""}>
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
      <Field label="Fee type">
        <Select name="fee_type" defaultValue="Tuition">
          {FEE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Amount (PKR)">
          <Input type="number" name="amount" min={1} required />
        </Field>
        <Field label="Amount already paid">
          <Input type="number" name="amount_paid" min={0} defaultValue={0} />
        </Field>
      </div>
      <Field label="Due date">
        <Input type="date" name="due_date" />
      </Field>
      <FormError error={state.error} />
      <SubmitButton>Add fee record</SubmitButton>
    </form>
  );
}
