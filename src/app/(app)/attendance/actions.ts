"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AttendanceState = { error: string | null; success: boolean };

export async function saveAttendanceAction(
  _prevState: AttendanceState,
  formData: FormData
): Promise<AttendanceState> {
  const class_id = String(formData.get("class_id") || "");
  const date = String(formData.get("date") || "");
  const studentIds = formData.getAll("student_id").map(String);

  if (!class_id || !date || studentIds.length === 0) {
    return { error: "Select a class and date first.", success: false };
  }

  const rows = studentIds.map((student_id) => ({
    student_id,
    class_id,
    date,
    status: String(formData.get(`status_${student_id}`) || "present"),
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,date" });

  if (error) return { error: error.message, success: false };

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
