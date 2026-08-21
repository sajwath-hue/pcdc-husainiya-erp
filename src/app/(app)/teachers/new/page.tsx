import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { TeacherForm } from "../TeacherForm";
import type { ClassRow, Subject } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function NewTeacherPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const [{ data: subjects }, { data: classes }] = await Promise.all([
    supabase.from("subjects").select("*").order("name"),
    supabase.from("classes").select("*").order("class_name"),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.teachers, href: "/teachers" },
          { label: t.common.new },
        ]}
      />
      <PageHeader title={t.teachers.newTitle} description={t.teachers.newSubtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <TeacherForm subjects={(subjects ?? []) as Subject[]} classes={(classes ?? []) as ClassRow[]} />
      </div>
    </div>
  );
}
