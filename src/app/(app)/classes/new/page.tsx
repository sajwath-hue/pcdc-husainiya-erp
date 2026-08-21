import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { ClassForm } from "../ClassForm";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function NewClassPage() {
  const t = getDictionary(await getLocale());
  const { years, selected } = await getAcademicYearContext();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.classes, href: "/classes" },
          { label: t.common.new },
        ]}
      />
      <PageHeader title={t.classes.newTitle} description={t.classes.subtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ClassForm years={years} selectedYearId={selected?.id} />
      </div>
    </div>
  );
}
