import type { SupabaseClient } from "@supabase/supabase-js";
import { extractTotalMarks, percentageToGrade } from "@/lib/utils";

/** Bulk attendance % and academic average % for a list of students — avoids N+1 queries. */
export async function getStudentQuickStatsBulk(supabase: SupabaseClient, studentIds: string[]) {
  const stats = new Map<string, { attendancePct: number; academicAveragePct: number; grade: string }>();
  if (studentIds.length === 0) return stats;

  const { data: attendance } = await supabase
    .from("attendance")
    .select("student_id, status")
    .in("student_id", studentIds);

  const attendanceByStudent = new Map<string, { total: number; present: number }>();
  for (const row of attendance ?? []) {
    const bucket = attendanceByStudent.get(row.student_id) ?? { total: 0, present: 0 };
    bucket.total++;
    if (row.status === "present" || row.status === "late") bucket.present++;
    attendanceByStudent.set(row.student_id, bucket);
  }

  const { data: results } = await supabase
    .from("exam_results")
    .select("student_id, marks_obtained, exams(total_marks)")
    .in("student_id", studentIds);

  const pctsByStudent = new Map<string, number[]>();
  for (const row of results ?? []) {
    const totalMarks = extractTotalMarks(row.exams);
    const pct = totalMarks ? (Number(row.marks_obtained) / totalMarks) * 100 : 0;
    const arr = pctsByStudent.get(row.student_id) ?? [];
    arr.push(pct);
    pctsByStudent.set(row.student_id, arr);
  }

  for (const id of studentIds) {
    const a = attendanceByStudent.get(id);
    const attendancePct = a && a.total ? Math.round((a.present / a.total) * 1000) / 10 : 0;
    const p = pctsByStudent.get(id) ?? [];
    const academicAveragePct = p.length ? Math.round((p.reduce((x, y) => x + y, 0) / p.length) * 10) / 10 : 0;
    stats.set(id, { attendancePct, academicAveragePct, grade: percentageToGrade(academicAveragePct) });
  }

  return stats;
}
