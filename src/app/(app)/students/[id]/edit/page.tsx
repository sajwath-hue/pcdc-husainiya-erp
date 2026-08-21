import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { StudentForm } from "../../StudentForm";
import type { ClassRow, Student } from "@/lib/types";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
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
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students", href: "/students" },
          { label: student.full_name, href: `/students/${id}` },
          { label: "Edit" },
        ]}
      />
      <PageHeader title={`Edit ${student.full_name}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StudentForm student={student as Student} years={years} classes={(classes ?? []) as ClassRow[]} />
      </div>
    </div>
  );
}
