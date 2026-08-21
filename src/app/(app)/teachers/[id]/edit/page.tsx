import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { TeacherForm } from "../../TeacherForm";
import type { ClassRow, Subject, Teacher } from "@/lib/types";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: teacher }, { data: subjects }, { data: classes }, { data: ts }, { data: tc }] = await Promise.all([
    supabase.from("teachers").select("*").eq("id", id).maybeSingle(),
    supabase.from("subjects").select("*").order("name"),
    supabase.from("classes").select("*").order("class_name"),
    supabase.from("teacher_subjects").select("subject_id").eq("teacher_id", id),
    supabase.from("teacher_classes").select("class_id").eq("teacher_id", id),
  ]);

  if (!teacher) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Teachers", href: "/teachers" },
          { label: "Edit" },
        ]}
      />
      <PageHeader title={`Edit ${teacher.full_name}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <TeacherForm
          teacher={teacher as Teacher}
          subjects={(subjects ?? []) as Subject[]}
          classes={(classes ?? []) as ClassRow[]}
          assignedSubjectIds={(ts ?? []).map((r) => r.subject_id)}
          assignedClassIds={(tc ?? []).map((r) => r.class_id)}
        />
      </div>
    </div>
  );
}
