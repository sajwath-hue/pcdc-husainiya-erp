import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { ExamForm } from "../ExamForm";
import type { ClassRow, Subject } from "@/lib/types";

export default async function NewExamPage() {
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
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams & Results", href: "/exams" },
          { label: "New" },
        ]}
      />
      <PageHeader title="Add Exam" description="Schedule a new exam for a class and subject." />
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
