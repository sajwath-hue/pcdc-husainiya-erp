"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function createAssignmentAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const class_id = String(formData.get("class_id") || "");
  const subject_id = String(formData.get("subject_id") || "") || null;
  const teacher_id = String(formData.get("teacher_id") || "") || null;
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const due_date = String(formData.get("due_date") || "") || null;

  if (!class_id || !title) return { error: "Class and title are required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .insert({ class_id, subject_id, teacher_id, title, description, due_date });

  if (error) return { error: error.message };

  revalidatePath("/assignments");
  redirect("/assignments");
}

export async function deleteAssignmentAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("assignments").delete().eq("id", id);
  revalidatePath("/assignments");
}
