import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { ClassForm } from "../../ClassForm";
import type { ClassRow } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const t = getDictionary(await getLocale());
  const { id } = await params;
  const supabase = await createClient();
  const { data: classRow } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();
  if (!classRow) notFound();

  const { years } = await getAcademicYearContext();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.classes, href: "/classes" },
          { label: t.common.edit },
        ]}
      />
      <PageHeader title={`${t.common.edit} ${classRow.class_name}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ClassForm years={years} classRow={classRow as ClassRow} />
      </div>
    </div>
  );
}
