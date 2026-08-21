import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AcademicYear } from "@/lib/types";

/** Returns every academic year plus which one is currently selected
 *  (cookie override, falling back to the DB's `is_current` flag). */
export async function getAcademicYearContext() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .order("year_label", { ascending: false });

  const list = (years ?? []) as AcademicYear[];
  const cookieYearId = cookieStore.get("ay_id")?.value;

  const selected =
    list.find((y) => y.id === cookieYearId) ??
    list.find((y) => y.is_current) ??
    list[0] ??
    null;

  return { years: list, selected };
}
