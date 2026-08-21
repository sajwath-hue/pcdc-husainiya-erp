"use client";

import { useActionState } from "react";
import { Field, Input, Select, SubmitButton, FormError } from "@/components/ui/Form";
import { createFeeAction, type FormState } from "./actions";
import type { AcademicYear, Student } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n";

const initialState: FormState = { error: null };

const FEE_TYPES = ["Tuition", "Admission", "Exam", "Transport", "Hostel", "Other"] as const;

function feeTypeLabel(t: Dictionary, value: (typeof FEE_TYPES)[number]) {
  const map: Record<(typeof FEE_TYPES)[number], string> = {
    Tuition: t.fees.feeTypeTuition,
    Admission: t.fees.feeTypeAdmission,
    Exam: t.fees.feeTypeExam,
    Transport: t.fees.feeTypeTransport,
    Hostel: t.fees.feeTypeHostel,
    Other: t.fees.feeTypeOther,
  };
  return map[value];
}

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
  const t = useDictionary();

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <Field label={t.common.student}>
        <Select name="student_id" required defaultValue={studentId ?? ""}>
          <option value="" disabled>
            {t.fees.selectStudent}
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.student_id})
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.classHub.academicYear}>
        <Select name="academic_year_id" required defaultValue={selectedYearId ?? ""}>
          <option value="" disabled>
            {t.students.selectAcademicYear}
          </option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.fees.feeType}>
        <Select name="fee_type" defaultValue="Tuition">
          {FEE_TYPES.map((ft) => (
            <option key={ft} value={ft}>
              {feeTypeLabel(t, ft)}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.fees.amountPkr}>
          <Input type="number" name="amount" min={1} required />
        </Field>
        <Field label={t.fees.amountAlreadyPaid}>
          <Input type="number" name="amount_paid" min={0} defaultValue={0} />
        </Field>
      </div>
      <Field label={t.common.dueDate}>
        <Input type="date" name="due_date" />
      </Field>
      <FormError error={state.error} />
      <SubmitButton>{t.fees.newTitle}</SubmitButton>
    </form>
  );
}
