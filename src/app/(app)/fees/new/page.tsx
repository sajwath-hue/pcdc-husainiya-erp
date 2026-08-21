import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { FeeForm } from "../FeeForm";
import type { Student } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function NewFeePage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const t = getDictionary(await getLocale());
  const { student } = await searchParams;
  const supabase = await createClient();
  const { years, selected } = await getAcademicYearContext();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("academic_year_id", selected?.id ?? "")
    .order("full_name");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.fees, href: "/fees" },
          { label: t.common.new },
        ]}
      />
      <PageHeader title={t.fees.newTitle} description={t.fees.subtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FeeForm students={(students ?? []) as Student[]} years={years} selectedYearId={selected?.id} studentId={student} />
      </div>
    </div>
  );
}
