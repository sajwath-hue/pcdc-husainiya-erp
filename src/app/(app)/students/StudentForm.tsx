"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea, SubmitButton, FormError } from "@/components/ui/Form";
import { createStudentAction, updateStudentAction, type FormState } from "./actions";
import type { AcademicYear, ClassRow, Student } from "@/lib/types";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

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
  const t = useDictionary();

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {student && <input type="hidden" name="id" value={student.id} />}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.students.personalInformation}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.students.fullName}>
            <Input name="full_name" required defaultValue={student?.full_name} placeholder="Ali Khan" />
          </Field>
          <Field label={t.students.admissionNo}>
            <Input name="admission_no" defaultValue={student?.admission_no ?? ""} placeholder="ADM-2026-1" />
          </Field>
          <Field label={t.students.dateOfBirth}>
            <Input type="date" name="dob" defaultValue={student?.dob ?? ""} />
          </Field>
          <Field label={t.students.gender}>
            <Select name="gender" defaultValue={student?.gender ?? ""}>
              <option value="">{t.common.all}</option>
              <option value="Male">{t.students.male}</option>
              <option value="Female">{t.students.female}</option>
              <option value="Other">{t.students.other}</option>
            </Select>
          </Field>
          <Field label={t.students.bloodGroup}>
            <Input name="blood_group" defaultValue={student?.blood_group ?? ""} placeholder="A+" />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.classHub.academicYear}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.classHub.academicYear}>
            <Select name="academic_year_id" required defaultValue={student?.academic_year_id ?? selectedYearId ?? ""}>
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
          <Field label={t.common.class}>
            <Select name="class_id" defaultValue={student?.class_id ?? ""}>
              <option value="">{t.common.unassigned}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.students.rollNoDot}>
            <Input type="number" name="roll_no" min={1} defaultValue={student?.roll_no ?? ""} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.students.guardianInformation}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.students.guardian}>
            <Input name="guardian_name" defaultValue={student?.guardian_name ?? ""} />
          </Field>
          <Field label={t.students.guardianPhone}>
            <Input name="guardian_phone" defaultValue={student?.guardian_phone ?? ""} placeholder="0300 5555555" />
          </Field>
          <Field label={t.students.guardianEmail}>
            <Input type="email" name="guardian_email" defaultValue={student?.guardian_email ?? ""} />
          </Field>
          <Field label={t.students.address}>
            <Textarea name="address" rows={2} defaultValue={student?.address ?? ""} />
          </Field>
        </div>
      </div>

      <FormError error={state.error} />
      <SubmitButton>{student ? t.common.saveChanges : t.students.addStudent}</SubmitButton>
    </form>
  );
}
