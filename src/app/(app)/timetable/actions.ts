"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addSlotAction(formData: FormData) {
  const class_id = String(formData.get("class_id") || "");
  const day_of_week = Number(formData.get("day_of_week") || 0);
  const period = Number(formData.get("period") || 0);
  const subject_id = String(formData.get("subject_id") || "") || null;
  const teacher_id = String(formData.get("teacher_id") || "") || null;
  const start_time = String(formData.get("start_time") || "") || null;
  const end_time = String(formData.get("end_time") || "") || null;

  if (!class_id || !day_of_week || !period) return;

  const supabase = await createClient();
  await supabase
    .from("timetable_slots")
    .insert({ class_id, day_of_week, period, subject_id, teacher_id, start_time, end_time });

  revalidatePath("/timetable");
}

export async function deleteSlotAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("timetable_slots").delete().eq("id", id);
  revalidatePath("/timetable");
}
