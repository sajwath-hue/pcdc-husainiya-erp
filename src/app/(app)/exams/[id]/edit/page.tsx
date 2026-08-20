import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { ExamForm } from "../../ExamForm";
import type { ClassRow, Subject } from "@/lib/types";

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: exam } = await supabase.from("exams").select("*").eq("id", id).maybeSingle();
  if (!exam) notFound();

  const { years } = await getAcademicYearContext();
  const [{ data: classes }, { data: subjects }] = await Promise.all([
    supabase.from("classes").select("*").eq("academic_year_id", exam.academic_year_id).order("class_name"),
    supabase.from("subjects").select("*").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams & Results", href: "/exams" },
          { label: "Edit" },
        ]}
      />
      <PageHeader title={`Edit ${exam.name}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ExamForm years={years} classes={(classes ?? []) as ClassRow[]} subjects={(subjects ?? []) as Subject[]} exam={exam} />
      </div>
    </div>
  );
}
