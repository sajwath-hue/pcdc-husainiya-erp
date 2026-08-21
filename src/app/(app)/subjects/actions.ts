"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function createSubjectAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Subject name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").insert({ name });
  if (error) return { error: error.message.includes("duplicate") ? "That subject already exists." : error.message };

  revalidatePath("/subjects");
  return { error: null };
}

export async function deleteSubjectAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("subjects").delete().eq("id", id);
  revalidatePath("/subjects");
}
