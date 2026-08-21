"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea, SubmitButton, FormError } from "@/components/ui/Form";
import { createStudentAction, updateStudentAction, type FormState } from "./actions";
import type { AcademicYear, ClassRow, Student } from "@/lib/types";

const initialState: FormState = { error: null };

export function StudentForm({
  student,
  years,
  classes,
  selectedYearId,
}: {
  student?: Student;
  years: AcademicYear[];
  classes: ClassRow[];
  selectedYearId?: string | null;
}) {
  const action = student ? updateStudentAction : createStudentAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {student && <input type="hidden" name="id" value={student.id} />}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input name="full_name" required defaultValue={student?.full_name} placeholder="Ali Khan" />
          </Field>
          <Field label="Admission No.">
            <Input name="admission_no" defaultValue={student?.admission_no ?? ""} placeholder="ADM-2026-1" />
          </Field>
          <Field label="Date of birth">
            <Input type="date" name="dob" defaultValue={student?.dob ?? ""} />
          </Field>
          <Field label="Gender">
            <Select name="gender" defaultValue={student?.gender ?? ""}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
          <Field label="Blood group">
            <Input name="blood_group" defaultValue={student?.blood_group ?? ""} placeholder="A+" />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Enrollment</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Academic year">
            <Select name="academic_year_id" required defaultValue={student?.academic_year_id ?? selectedYearId ?? ""}>
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
          <Field label="Class">
            <Select name="class_id" defaultValue={student?.class_id ?? ""}>
              <option value="">Unassigned</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Roll number">
            <Input type="number" name="roll_no" min={1} defaultValue={student?.roll_no ?? ""} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Guardian Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Guardian name">
            <Input name="guardian_name" defaultValue={student?.guardian_name ?? ""} />
          </Field>
          <Field label="Guardian phone">
            <Input name="guardian_phone" defaultValue={student?.guardian_phone ?? ""} placeholder="0300 5555555" />
          </Field>
          <Field label="Guardian email">
            <Input type="email" name="guardian_email" defaultValue={student?.guardian_email ?? ""} />
          </Field>
          <Field label="Address">
            <Textarea name="address" rows={2} defaultValue={student?.address ?? ""} />
          </Field>
        </div>
      </div>

      <FormError error={state.error} />
      <SubmitButton>{student ? "Save changes" : "Add student"}</SubmitButton>
    </form>
  );
}
