"use client";

import { useActionState } from "react";
import { Field, Input, Checkbox, SubmitButton, FormError } from "@/components/ui/Form";
import { createAcademicYearAction, updateAcademicYearAction, type FormState } from "./actions";
import type { AcademicYear } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

const initialState: FormState = { error: null };

export function AcademicYearForm({ year }: { year?: AcademicYear }) {
  const action = year ? updateAcademicYearAction : createAcademicYearAction;
  const [state, formAction] = useActionState(action, initialState);
  const t = useDictionary();

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {year && <input type="hidden" name="id" value={year.id} />}
      <Field label={t.academicYears.yearLabel} hint="e.g. 2026-27">
        <Input name="year_label" required defaultValue={year?.year_label} placeholder="2026-27" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.academicYears.startDate}>
          <Input type="date" name="start_date" required defaultValue={year?.start_date} />
        </Field>
        <Field label={t.academicYears.endDate}>
          <Input type="date" name="end_date" required defaultValue={year?.end_date} />
        </Field>
      </div>
      <Checkbox name="is_current" label={t.academicYears.makeCurrent} defaultChecked={year?.is_current} />
      <FormError error={state.error} />
      <SubmitButton>{year ? t.common.saveChanges : t.academicYears.addAcademicYear}</SubmitButton>
    </form>
  );
}
