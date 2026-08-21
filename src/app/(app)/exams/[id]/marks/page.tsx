import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { MarksForm } from "./MarksForm";
import type { Student } from "@/lib/types";
import { format, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function EnterMarksPage({ params }: { params: Promise<{ id: string }> }) {
  const t = getDictionary(await getLocale());
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
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.examsResults, href: "/exams" },
          { label: format(t.exams.marksBreadcrumb, { name: exam.name }) },
        ]}
      />
      <PageHeader
        title={format(t.exams.enterMarksTitle, { name: exam.name })}
        description={format(t.exams.enterMarksDescription, {
          class: classInfo?.class_name ?? "",
          subject: subjectInfo?.name ?? "",
          total: exam.total_marks,
        })}
      />

      {list.length === 0 ? (
        <EmptyState title={t.exams.noStudentsInClassYet} />
      ) : (
        <MarksForm examId={id} totalMarks={exam.total_marks} students={list} existing={existing} />
      )}
    </div>
  );
}
