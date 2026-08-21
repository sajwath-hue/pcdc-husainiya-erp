"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

async function nextStudentId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  academicYearId: string
) {
  const { data: year } = await supabase
    .from("academic_years")
    .select("start_date")
    .eq("id", academicYearId)
    .maybeSingle();
  const yearNum = year ? new Date(year.start_date).getFullYear() : new Date().getFullYear();

  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("academic_year_id", academicYearId);

  return `STU-${yearNum}-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

function parseStudentInput(formData: FormData) {
  return {
    full_name: String(formData.get("full_name") || "").trim(),
    admission_no: String(formData.get("admission_no") || "").trim() || null,
    dob: String(formData.get("dob") || "") || null,
    gender: (String(formData.get("gender") || "") || null) as "Male" | "Female" | "Other" | null,
    blood_group: String(formData.get("blood_group") || "").trim() || null,
    class_id: String(formData.get("class_id") || "") || null,
    academic_year_id: String(formData.get("academic_year_id") || "") || null,
    roll_no: formData.get("roll_no") ? Number(formData.get("roll_no")) : null,
    guardian_name: String(formData.get("guardian_name") || "").trim() || null,
    guardian_phone: String(formData.get("guardian_phone") || "").trim() || null,
    guardian_email: String(formData.get("guardian_email") || "").trim() || null,
    address: String(formData.get("address") || "").trim() || null,
  };
}

export async function createStudentAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input = parseStudentInput(formData);
  if (!input.full_name || !input.academic_year_id) {
    return { error: "Full name and academic year are required." };
  }

  const supabase = await createClient();
  const student_id = await nextStudentId(supabase, input.academic_year_id);

  const { error } = await supabase.from("students").insert({ ...input, student_id });
  if (error) return { error: error.message };

  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudentAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") || "");
  const input = parseStudentInput(formData);
  if (!id || !input.full_name) return { error: "Full name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("students").update(input).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  redirect(`/students/${id}`);
}

export async function toggleStudentStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const current = String(formData.get("status") || "active");
  const supabase = await createClient();
  await supabase
    .from("students")
    .update({ status: current === "active" ? "inactive" : "active" })
    .eq("id", id);
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function deleteStudentAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("students").delete().eq("id", id);
  revalidatePath("/students");
}

export async function promoteStudentAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const class_id = String(formData.get("class_id") || "");
  const academic_year_id = String(formData.get("academic_year_id") || "");
  const roll_no = formData.get("roll_no") ? Number(formData.get("roll_no")) : null;

  if (!id || !class_id || !academic_year_id) return;

  const supabase = await createClient();
  await supabase.from("students").update({ class_id, academic_year_id, roll_no }).eq("id", id);
  revalidatePath(`/students/${id}`);
}

export async function importStudentsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("file");
  const academic_year_id = String(formData.get("academic_year_id") || "");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file to import." };
  if (!academic_year_id) return { error: "Select an academic year to import into." };

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { error: "CSV file has no data rows." };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, class_name")
    .eq("academic_year_id", academic_year_id);
  const classByName = new Map((classes ?? []).map((c) => [c.class_name.toLowerCase(), c.id]));

  let inserted = 0;
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = cells[idx] ?? ""));

    if (!row.full_name) continue;

    const student_id = await nextStudentId(supabase, academic_year_id);
    await supabase.from("students").insert({
      student_id,
      full_name: row.full_name,
      admission_no: row.admission_no || null,
      gender: (row.gender as "Male" | "Female" | "Other") || null,
      dob: row.dob || null,
      roll_no: row.roll_no ? Number(row.roll_no) : null,
      class_id: row.class_name ? classByName.get(row.class_name.toLowerCase()) ?? null : null,
      academic_year_id,
      guardian_name: row.guardian_name || null,
      guardian_phone: row.guardian_phone || null,
    });
    inserted++;
  }

  revalidatePath("/students");
  return { error: inserted > 0 ? null : "No valid rows found in the file." };
}
