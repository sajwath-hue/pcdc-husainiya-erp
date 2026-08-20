import type { SupabaseClient } from "@supabase/supabase-js";
import { extractTotalMarks, percentageToGrade } from "@/lib/utils";

export interface StudentSummary {
  attendancePct: number;
  academicAveragePct: number;
  grade: string;
  classPosition: number | null;
  classSize: number;
  totalExams: number;
}

export async function getStudentSummary(
  supabase: SupabaseClient,
  studentId: string,
  classId: string | null
): Promise<StudentSummary> {
  const { data: attendance } = await supabase.from("attendance").select("status").eq("student_id", studentId);
  const total = attendance?.length ?? 0;
  const present = attendance?.filter((a) => a.status === "present" || a.status === "late").length ?? 0;
  const attendancePct = total ? Math.round((present / total) * 1000) / 10 : 0;

  const { data: results } = await supabase
    .from("exam_results")
    .select("marks_obtained, exams(total_marks)")
    .eq("student_id", studentId);

  const pcts = (results ?? []).map((r) => {
    const totalMarks = extractTotalMarks(r.exams);
    return totalMarks ? (Number(r.marks_obtained) / totalMarks) * 100 : 0;
  });
  const academicAveragePct = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10 : 0;

  let classPosition: number | null = null;
  let classSize = 0;
  if (classId) {
    const { data: classmates } = await supabase.from("students").select("id").eq("class_id", classId);
    classSize = classmates?.length ?? 0;

    const ranking: { id: string; avg: number }[] = [];
    for (const cm of classmates ?? []) {
      const { data: r } = await supabase
        .from("exam_results")
        .select("marks_obtained, exams(total_marks)")
        .eq("student_id", cm.id);
      const p = (r ?? []).map((row) => {
        const totalMarks = extractTotalMarks(row.exams);
        return totalMarks ? (Number(row.marks_obtained) / totalMarks) * 100 : 0;
      });
      ranking.push({ id: cm.id, avg: p.length ? p.reduce((a, b) => a + b, 0) / p.length : 0 });
    }
    ranking.sort((a, b) => b.avg - a.avg);
    const idx = ranking.findIndex((r) => r.id === studentId);
    classPosition = idx >= 0 ? idx + 1 : null;
  }

  return {
    attendancePct,
    academicAveragePct,
    grade: percentageToGrade(academicAveragePct),
    classPosition,
    classSize,
    totalExams: results?.length ?? 0,
  };
}
