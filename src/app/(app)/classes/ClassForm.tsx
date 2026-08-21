"use client";

import { useActionState } from "react";
import { Field, Input, Select, SubmitButton, FormError } from "@/components/ui/Form";
import { createClassAction, updateClassAction, type FormState } from "./actions";
import type { AcademicYear, ClassRow } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

const initialState: FormState = { error: null };

export function ClassForm({
  years,
  selectedYearId,
  classRow,
}: {
  years: AcademicYear[];
  selectedYearId?: string | null;
  classRow?: ClassRow;
}) {
  const action = classRow ? updateClassAction : createClassAction;
  const [state, formAction] = useActionState(action, initialState);
  const t = useDictionary();

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {classRow && <input type="hidden" name="id" value={classRow.id} />}
      <Field label={t.classHub.academicYear}>
        <Select
          name="academic_year_id"
          required
          defaultValue={classRow?.academic_year_id ?? selectedYearId ?? ""}
        >
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
      <Field label={t.classes.className} hint="e.g. Class 1-A">
        <Input name="class_name" required defaultValue={classRow?.class_name} placeholder="Class 1-A" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.classes.roomLabel}>
          <Input name="room" defaultValue={classRow?.room ?? ""} placeholder="A-101" />
        </Field>
        <Field label={t.classes.capacityLabel}>
          <Input type="number" name="capacity" min={1} defaultValue={classRow?.capacity ?? 40} />
        </Field>
      </div>
      <FormError error={state.error} />
      <SubmitButton>{classRow ? t.common.saveChanges : t.classes.addClass}</SubmitButton>
    </form>
  );
}
