import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { AssignmentForm } from "../AssignmentForm";
import type { ClassRow, Subject, Teacher } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function NewAssignmentPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();
  const [{ data: classes }, { data: subjects }, { data: teachers }] = await Promise.all([
    supabase.from("classes").select("*").eq("academic_year_id", selected?.id ?? "").order("class_name"),
    supabase.from("subjects").select("*").order("name"),
    supabase.from("teachers").select("*").eq("status", "active").order("full_name"),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.assignments, href: "/assignments" },
          { label: t.common.new },
        ]}
      />
      <PageHeader title={t.assignments.newTitle} description={t.assignments.newSubtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AssignmentForm
          classes={(classes ?? []) as ClassRow[]}
          subjects={(subjects ?? []) as Subject[]}
          teachers={(teachers ?? []) as Teacher[]}
        />
      </div>
    </div>
  );
}
