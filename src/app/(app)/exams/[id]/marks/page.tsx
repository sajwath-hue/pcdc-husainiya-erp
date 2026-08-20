import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { MarksForm } from "./MarksForm";
import type { Student } from "@/lib/types";

export default async function EnterMarksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase.from("exams").select("*, classes(class_name), subjects(name)").eq("id", id).maybeSingle();
  if (!exam) notFound();

  const { data: students } = await supabase.from("students").select("*").eq("class_id", exam.class_id).order("roll_no");
  const list = (students ?? []) as Student[];

  const { data: results } = await supabase.from("exam_results").select("student_id, marks_obtained").eq("exam_id", id);
  const existing = new Map((results ?? []).map((r) => [r.student_id, Number(r.marks_obtained)]));

  const classInfo = exam.classes as unknown as { class_name: string } | null;
  const subjectInfo = exam.subjects as unknown as { name: string } | null;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams & Results", href: "/exams" },
          { label: `${exam.name} — Marks` },
        ]}
      />
      <PageHeader
        title={`${exam.name} — Enter Marks`}
        description={`${classInfo?.class_name ?? ""} · ${subjectInfo?.name ?? ""} · Total ${exam.total_marks} marks`}
      />

      {list.length === 0 ? (
        <EmptyState title="No students in this class yet" />
      ) : (
        <MarksForm examId={id} totalMarks={exam.total_marks} students={list} existing={existing} />
      )}
    </div>
  );
}
