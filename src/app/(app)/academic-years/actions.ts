"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function createAcademicYearAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const year_label = String(formData.get("year_label") || "").trim();
  const start_date = String(formData.get("start_date") || "");
  const end_date = String(formData.get("end_date") || "");
  const is_current = formData.get("is_current") === "on";

  if (!year_label || !start_date || !end_date) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();

  if (is_current) {
    await supabase.from("academic_years").update({ is_current: false }).eq("is_current", true);
  }

  const { error } = await supabase
    .from("academic_years")
    .insert({ year_label, start_date, end_date, is_current });

  if (error) return { error: error.message };

  revalidatePath("/academic-years");
  redirect("/academic-years");
}

export async function updateAcademicYearAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") || "");
  const year_label = String(formData.get("year_label") || "").trim();
  const start_date = String(formData.get("start_date") || "");
  const end_date = String(formData.get("end_date") || "");
  const is_current = formData.get("is_current") === "on";

  if (!id || !year_label || !start_date || !end_date) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();

  if (is_current) {
    await supabase.from("academic_years").update({ is_current: false }).eq("is_current", true);
  }

  const { error } = await supabase
    .from("academic_years")
    .update({ year_label, start_date, end_date, is_current })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/academic-years");
  redirect("/academic-years");
}

export async function toggleRecordLockAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const current = String(formData.get("record_lock") || "open");
  const supabase = await createClient();
  await supabase
    .from("academic_years")
    .update({ record_lock: current === "open" ? "locked" : "open" })
    .eq("id", id);
  revalidatePath("/academic-years");
}

export async function toggleStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const current = String(formData.get("status") || "active");
  const supabase = await createClient();
  await supabase
    .from("academic_years")
    .update({ status: current === "active" ? "inactive" : "active" })
    .eq("id", id);
  revalidatePath("/academic-years");
}

export async function deleteAcademicYearAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();

  const { count } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("academic_year_id", id);

  if (count && count > 0) {
    return; // Guarded by the UI, and by nothing deleting it server-side either.
  }

  await supabase.from("academic_years").delete().eq("id", id);
  revalidatePath("/academic-years");
}
