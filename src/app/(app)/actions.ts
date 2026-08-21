"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function setAcademicYearAction(formData: FormData) {
  const yearId = formData.get("academic_year_id");
  const redirectTo = formData.get("redirect_to");
  if (typeof yearId === "string" && yearId) {
    const cookieStore = await cookies();
    cookieStore.set("ay_id", yearId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/dashboard");
}
