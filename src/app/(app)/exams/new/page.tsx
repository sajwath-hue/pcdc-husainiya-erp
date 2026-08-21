import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { ExamForm } from "../ExamForm";
import type { ClassRow, Subject } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function NewExamPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const { years, selected } = await getAcademicYearContext();
  const [{ data: classes }, { data: subjects }] = await Promise.all([
    supabase.from("classes").select("*").eq("academic_year_id", selected?.id ?? "").order("class_name"),
    supabase.from("subjects").select("*").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.examsResults, href: "/exams" },
          { label: t.common.new },
        ]}
      />
      <PageHeader title={t.exams.newTitle} description={t.exams.newSubtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ExamForm
          years={years}
          classes={(classes ?? []) as ClassRow[]}
          subjects={(subjects ?? []) as Subject[]}
          selectedYearId={selected?.id}
        />
      </div>
    </div>
  );
}
