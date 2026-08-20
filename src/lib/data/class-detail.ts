import type { SupabaseClient } from "@supabase/supabase-js";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getClassStats(supabase: SupabaseClient, classId: string) {
  const today = isoDate(new Date());

  const [{ count: totalStudents }, { count: totalTeachers }] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("class_id", classId),
    supabase.from("teacher_classes").select("teacher_id", { count: "exact", head: true }).eq("class_id", classId),
  ]);

  const { data: todayRows } = await supabase
    .from("attendance")
    .select("status")
    .eq("class_id", classId)
    .eq("date", today);
  const todayTotal = todayRows?.length ?? 0;
  const todayPresent = todayRows?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
  const todayPct = todayTotal ? Math.round((todayPresent / todayTotal) * 1000) / 10 : 0;

  const { data: allRows } = await supabase.from("attendance").select("status").eq("class_id", classId);
  const allTotal = allRows?.length ?? 0;
  const allPresent = allRows?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
  const avgAttendance = allTotal ? Math.round((allPresent / allTotal) * 1000) / 10 : 0;

  const { data: exams } = await supabase.from("exams").select("id, total_marks").eq("class_id", classId);
  const examIds = (exams ?? []).map((e) => e.id);
  const totalsByExam = new Map((exams ?? []).map((e) => [e.id, Number(e.total_marks) || 100]));
  let avgResult = 0;
  if (examIds.length) {
    const { data: results } = await supabase
      .from("exam_results")
      .select("exam_id, marks_obtained")
      .in("exam_id", examIds);
    const pcts = (results ?? []).map((r) => {
      const total = totalsByExam.get(r.exam_id) ?? 100;
      return total ? (Number(r.marks_obtained) / total) * 100 : 0;
    });
    avgResult = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10 : 0;
  }

  const { data: students } = await supabase.from("students").select("id").eq("class_id", classId);
  const studentIds = (students ?? []).map((s) => s.id);
  let pendingFees = 0;
  if (studentIds.length) {
    const { data: fees } = await supabase
      .from("fees")
      .select("amount, amount_paid, status")
      .in("student_id", studentIds);
    for (const f of fees ?? []) {
      if (f.status !== "paid") pendingFees += Number(f.amount) - Number(f.amount_paid);
    }
  }

  return {
    totalStudents: totalStudents ?? 0,
    totalTeachers: totalTeachers ?? 0,
    todayAttendancePct: todayPct,
    avgAttendancePct: avgAttendance,
    avgResultPct: avgResult,
    pendingFees,
  };
}
