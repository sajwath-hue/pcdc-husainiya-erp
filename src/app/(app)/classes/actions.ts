"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

function parseClassInput(formData: FormData) {
  return {
    academic_year_id: String(formData.get("academic_year_id") || ""),
    class_name: String(formData.get("class_name") || "").trim(),
    room: String(formData.get("room") || "").trim() || null,
    capacity: Number(formData.get("capacity") || 40),
  };
}

export async function createClassAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input = parseClassInput(formData);
  if (!input.academic_year_id || !input.class_name) {
    return { error: "Academic year and class name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("classes").insert(input);
  if (error) return { error: error.message };

  revalidatePath("/classes");
  redirect("/classes");
}

export async function updateClassAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") || "");
  const input = parseClassInput(formData);
  if (!id || !input.academic_year_id || !input.class_name) {
    return { error: "Academic year and class name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("classes").update(input).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/classes");
  revalidatePath(`/classes/${id}`);
  redirect("/classes");
}

export async function toggleClassStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const current = String(formData.get("status") || "active");
  const supabase = await createClient();
  await supabase
    .from("classes")
    .update({ status: current === "active" ? "inactive" : "active" })
    .eq("id", id);
  revalidatePath("/classes");
}

export async function deleteClassAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();

  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("class_id", id);

  if (count && count > 0) return;

  await supabase.from("classes").delete().eq("id", id);
  revalidatePath("/classes");
}

export async function assignTeachersAction(formData: FormData) {
  const classId = String(formData.get("class_id") || "");
  const teacherIds = formData.getAll("teacher_ids").map(String);

  const supabase = await createClient();
  await supabase.from("teacher_classes").delete().eq("class_id", classId);
  if (teacherIds.length) {
    await supabase
      .from("teacher_classes")
      .insert(teacherIds.map((teacher_id) => ({ teacher_id, class_id: classId })));
  }
  revalidatePath(`/classes/${classId}`);
}
