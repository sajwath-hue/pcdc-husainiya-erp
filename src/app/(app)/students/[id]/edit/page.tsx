import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { StudentForm } from "../../StudentForm";
import type { ClassRow, Student } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const t = getDictionary(await getLocale());
  const { id } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  if (!student) notFound();

  const { years } = await getAcademicYearContext();
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("academic_year_id", student.academic_year_id ?? "")
    .order("class_name");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.students, href: "/students" },
          { label: student.full_name, href: `/students/${id}` },
          { label: t.common.edit },
        ]}
      />
      <PageHeader title={`${t.common.edit} ${student.full_name}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StudentForm student={student as Student} years={years} classes={(classes ?? []) as ClassRow[]} />
      </div>
    </div>
  );
}
