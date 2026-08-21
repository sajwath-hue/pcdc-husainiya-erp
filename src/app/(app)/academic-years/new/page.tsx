import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { AcademicYearForm } from "../AcademicYearForm";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function NewAcademicYearPage() {
  const t = getDictionary(await getLocale());
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.academicYears, href: "/academic-years" },
          { label: t.common.new },
        ]}
      />
      <PageHeader title={t.academicYears.newTitle} description={t.academicYears.newSubtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AcademicYearForm />
      </div>
    </div>
  );
}
