import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { AcademicYearForm } from "../../AcademicYearForm";
import type { AcademicYear } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function EditAcademicYearPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = getDictionary(await getLocale());
  const { id } = await params;
  const supabase = await createClient();
  const { data: year } = await supabase.from("academic_years").select("*").eq("id", id).maybeSingle();

  if (!year) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.academicYears, href: "/academic-years" },
          { label: t.common.edit },
        ]}
      />
      <PageHeader title={`${t.common.edit} ${year.year_label}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AcademicYearForm year={year as AcademicYear} />
      </div>
    </div>
  );
}
