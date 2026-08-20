"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addRemarkAction(formData: FormData) {
  const student_id = String(formData.get("student_id") || "");
  const remark = String(formData.get("remark") || "").trim();
  if (!student_id || !remark) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: teacher } = user?.email
    ? await supabase.from("teachers").select("id").eq("email", user.email).maybeSingle()
    : { data: null };

  await supabase.from("teacher_remarks").insert({ student_id, remark, teacher_id: teacher?.id ?? null });
  revalidatePath(`/students/${student_id}`);
}

export async function deleteRemarkAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const student_id = String(formData.get("student_id") || "");
  const supabase = await createClient();
  await supabase.from("teacher_remarks").delete().eq("id", id);
  revalidatePath(`/students/${student_id}`);
}

export async function addBehaviorAction(formData: FormData) {
  const student_id = String(formData.get("student_id") || "");
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "neutral");
  if (!student_id || !description) return;

  const supabase = await createClient();
  await supabase.from("behavior_records").insert({ student_id, description, type });
  revalidatePath(`/students/${student_id}`);
}

export async function deleteBehaviorAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const student_id = String(formData.get("student_id") || "");
  const supabase = await createClient();
  await supabase.from("behavior_records").delete().eq("id", id);
  revalidatePath(`/students/${student_id}`);
}

export async function addDocumentAction(formData: FormData) {
  const student_id = String(formData.get("student_id") || "");
  const name = String(formData.get("name") || "").trim();
  const file_url = String(formData.get("file_url") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!student_id || !name) return;

  const supabase = await createClient();
  await supabase.from("student_documents").insert({ student_id, name, file_url, notes });
  revalidatePath(`/students/${student_id}`);
}

export async function deleteDocumentAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const student_id = String(formData.get("student_id") || "");
  const supabase = await createClient();
  await supabase.from("student_documents").delete().eq("id", id);
  revalidatePath(`/students/${student_id}`);
}
