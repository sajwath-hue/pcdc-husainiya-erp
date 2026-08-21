import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { StudentForm } from "../StudentForm";
import type { ClassRow } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function NewStudentPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const { years, selected } = await getAcademicYearContext();
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("academic_year_id", selected?.id ?? "")
    .order("class_name");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.students, href: "/students" },
          { label: t.common.new },
        ]}
      />
      <PageHeader title={t.students.newTitle} description={t.classHub.studentsCardSubtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StudentForm years={years} classes={(classes ?? []) as ClassRow[]} selectedYearId={selected?.id} />
      </div>
    </div>
  );
}
