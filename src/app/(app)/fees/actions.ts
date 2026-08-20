"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

function computeStatus(amount: number, amountPaid: number, dueDate: string | null) {
  if (amountPaid >= amount && amount > 0) return "paid";
  if (dueDate && new Date(dueDate) < new Date(new Date().toDateString())) return "overdue";
  return "pending";
}

export async function createFeeAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const student_id = String(formData.get("student_id") || "");
  const academic_year_id = String(formData.get("academic_year_id") || "");
  const fee_type = String(formData.get("fee_type") || "Tuition").trim();
  const amount = Number(formData.get("amount") || 0);
  const amount_paid = Number(formData.get("amount_paid") || 0);
  const due_date = String(formData.get("due_date") || "") || null;

  if (!student_id || !academic_year_id || amount <= 0) {
    return { error: "Student, academic year and a valid amount are required." };
  }

  const status = computeStatus(amount, amount_paid, due_date);
  const paid_date = status === "paid" ? new Date().toISOString().slice(0, 10) : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("fees")
    .insert({ student_id, academic_year_id, fee_type, amount, amount_paid, due_date, status, paid_date });

  if (error) return { error: error.message };

  revalidatePath("/fees");
  revalidatePath("/financial");
  revalidatePath("/dashboard");
  redirect(`/students/${student_id}?tab=fees`);
}

export async function recordPaymentAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const additional = Number(formData.get("additional") || 0);
  if (!id || additional <= 0) return;

  const supabase = await createClient();
  const { data: fee } = await supabase.from("fees").select("amount, amount_paid, due_date").eq("id", id).maybeSingle();
  if (!fee) return;

  const amount_paid = Number(fee.amount_paid) + additional;
  const status = computeStatus(Number(fee.amount), amount_paid, fee.due_date);
  const paid_date = status === "paid" ? new Date().toISOString().slice(0, 10) : null;

  await supabase.from("fees").update({ amount_paid, status, paid_date }).eq("id", id);
  revalidatePath("/fees");
  revalidatePath("/financial");
  revalidatePath("/dashboard");
}

export async function deleteFeeAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("fees").delete().eq("id", id);
  revalidatePath("/fees");
  revalidatePath("/financial");
}
