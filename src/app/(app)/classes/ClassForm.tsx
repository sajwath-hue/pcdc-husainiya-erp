"use client";

import { useActionState } from "react";
import { Field, Input, Select, SubmitButton, FormError } from "@/components/ui/Form";
import { createClassAction, updateClassAction, type FormState } from "./actions";
import type { AcademicYear, ClassRow } from "@/lib/types";

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

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {classRow && <input type="hidden" name="id" value={classRow.id} />}
      <Field label="Academic year">
        <Select
          name="academic_year_id"
          required
          defaultValue={classRow?.academic_year_id ?? selectedYearId ?? ""}
        >
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
      <Field label="Class name" hint="e.g. Class 1-A">
        <Input name="class_name" required defaultValue={classRow?.class_name} placeholder="Class 1-A" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Room">
          <Input name="room" defaultValue={classRow?.room ?? ""} placeholder="A-101" />
        </Field>
        <Field label="Capacity">
          <Input type="number" name="capacity" min={1} defaultValue={classRow?.capacity ?? 40} />
        </Field>
      </div>
      <FormError error={state.error} />
      <SubmitButton>{classRow ? "Save changes" : "Create class"}</SubmitButton>
    </form>
  );
}
