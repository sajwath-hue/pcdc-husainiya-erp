"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };
export type MarksState = { error: string | null; success: boolean };

function parseExamInput(formData: FormData) {
  return {
    academic_year_id: String(formData.get("academic_year_id") || ""),
    class_id: String(formData.get("class_id") || ""),
    subject_id: String(formData.get("subject_id") || ""),
    name: String(formData.get("name") || "").trim(),
    term: String(formData.get("term") || "").trim() || null,
    exam_date: String(formData.get("exam_date") || "") || null,
    total_marks: Number(formData.get("total_marks") || 100),
  };
}

export async function createExamAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input = parseExamInput(formData);
  if (!input.academic_year_id || !input.class_id || !input.subject_id || !input.name) {
    return { error: "Academic year, class, subject and name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("exams").insert(input);
  if (error) return { error: error.message };

  revalidatePath("/exams");
  redirect("/exams");
}

export async function updateExamAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") || "");
  const input = parseExamInput(formData);
  if (!id || !input.class_id || !input.subject_id || !input.name) {
    return { error: "Class, subject and name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("exams").update(input).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/exams");
  redirect("/exams");
}

export async function deleteExamAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("exams").delete().eq("id", id);
  revalidatePath("/exams");
}

export async function saveMarksAction(
  _prevState: MarksState,
  formData: FormData
): Promise<MarksState> {
  const exam_id = String(formData.get("exam_id") || "");
  const studentIds = formData.getAll("student_id").map(String);
  if (!exam_id || studentIds.length === 0) return { error: "Nothing to save.", success: false };

  const rows = studentIds
    .map((student_id) => ({
      exam_id,
      student_id,
      marks_obtained: formData.get(`marks_${student_id}`),
    }))
    .filter((r) => r.marks_obtained !== null && r.marks_obtained !== "")
    .map((r) => ({ ...r, marks_obtained: Number(r.marks_obtained) }));

  if (rows.length === 0) return { error: "Enter at least one mark.", success: false };

  const supabase = await createClient();
  const { error } = await supabase.from("exam_results").upsert(rows, { onConflict: "exam_id,student_id" });
  if (error) return { error: error.message, success: false };

  revalidatePath("/exams");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
