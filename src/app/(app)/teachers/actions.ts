"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

async function nextEmployeeId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { count } = await supabase.from("teachers").select("id", { count: "exact", head: true });
  return `TCH-${String((count ?? 0) + 1).padStart(3, "0")}`;
}

async function syncAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  formData: FormData
) {
  const subjectIds = formData.getAll("subject_ids").map(String);
  const classIds = formData.getAll("class_ids").map(String);

  await supabase.from("teacher_subjects").delete().eq("teacher_id", teacherId);
  if (subjectIds.length) {
    await supabase
      .from("teacher_subjects")
      .insert(subjectIds.map((subject_id) => ({ teacher_id: teacherId, subject_id })));
  }

  await supabase.from("teacher_classes").delete().eq("teacher_id", teacherId);
  if (classIds.length) {
    await supabase
      .from("teacher_classes")
      .insert(classIds.map((class_id) => ({ teacher_id: teacherId, class_id })));
  }
}

export async function createTeacherAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!full_name) return { error: "Full name is required." };

  const supabase = await createClient();
  const employee_id = await nextEmployeeId(supabase);

  const { data, error } = await supabase
    .from("teachers")
    .insert({ full_name, email, phone, employee_id })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || "Could not create teacher." };

  await syncAssignments(supabase, data.id, formData);

  revalidatePath("/teachers");
  redirect("/teachers");
}

export async function updateTeacherAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") || "");
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!id || !full_name) return { error: "Full name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("teachers").update({ full_name, email, phone }).eq("id", id);
  if (error) return { error: error.message };

  await syncAssignments(supabase, id, formData);

  revalidatePath("/teachers");
  revalidatePath(`/teachers/${id}`);
  redirect("/teachers");
}

export async function toggleTeacherStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const current = String(formData.get("status") || "active");
  const supabase = await createClient();
  await supabase
    .from("teachers")
    .update({ status: current === "active" ? "inactive" : "active" })
    .eq("id", id);
  revalidatePath("/teachers");
}

export async function deleteTeacherAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("teachers").delete().eq("id", id);
  revalidatePath("/teachers");
}
