import type { SupabaseClient } from "@supabase/supabase-js";
import { percentageToGrade } from "@/lib/utils";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getDashboardStats(supabase: SupabaseClient, academicYearId: string | null) {
  const today = isoDate(new Date());

  let studentsQuery = supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  let classesQuery = supabase.from("classes").select("id", { count: "exact", head: true });
  if (academicYearId) {
    studentsQuery = studentsQuery.eq("academic_year_id", academicYearId);
    classesQuery = classesQuery.eq("academic_year_id", academicYearId);
  }

  const [{ count: totalStudents }, { count: totalTeachers }, { count: totalClasses }] =
    await Promise.all([
      studentsQuery,
      supabase.from("teachers").select("id", { count: "exact", head: true }).eq("status", "active"),
      classesQuery,
    ]);

  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("status")
    .eq("date", today);

  const todayTotal = todayAttendance?.length ?? 0;
  const todayPresent = todayAttendance?.filter((a) => a.status === "present" || a.status === "late").length ?? 0;
  const todayPct = todayTotal ? Math.round((todayPresent / todayTotal) * 1000) / 10 : 0;

  let pendingFeesTotal = 0;
  let feeCollected = 0;
  let feeExpected = 0;
  if (academicYearId) {
    const { data: fees } = await supabase
      .from("fees")
      .select("amount, amount_paid, status")
      .eq("academic_year_id", academicYearId);
    for (const f of fees ?? []) {
      feeExpected += Number(f.amount);
      feeCollected += Number(f.amount_paid);
      if (f.status !== "paid") pendingFeesTotal += Number(f.amount) - Number(f.amount_paid);
    }
  }

  let upcomingExams = 0;
  if (academicYearId) {
    const { count } = await supabase
      .from("exams")
      .select("id", { count: "exact", head: true })
      .eq("academic_year_id", academicYearId)
      .gte("exam_date", today);
    upcomingExams = count ?? 0;
  }

  // Attendance trend: last 7 days.
  const days: { label: string; pct: number }[] = [];
  const since = new Date();
  since.setDate(since.getDate() - 6);
  const { data: weekAttendance } = await supabase
    .from("attendance")
    .select("date, status")
    .gte("date", isoDate(since))
    .lte("date", today);

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = isoDate(d);
    const dayRecords = (weekAttendance ?? []).filter((r) => r.date === key);
    const present = dayRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const pct = dayRecords.length ? Math.round((present / dayRecords.length) * 1000) / 10 : 0;
    days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), pct });
  }

  // Grade distribution: average % per student across exam results this year.
  const gradeCounts: Record<string, number> = { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  let averageResultPct = 0;
  if (academicYearId) {
    const { data: exams } = await supabase
      .from("exams")
      .select("id, total_marks")
      .eq("academic_year_id", academicYearId);
    const examIds = (exams ?? []).map((e) => e.id);
    const totalsByExam = new Map((exams ?? []).map((e) => [e.id, Number(e.total_marks) || 100]));

    if (examIds.length) {
      const { data: results } = await supabase
        .from("exam_results")
        .select("student_id, exam_id, marks_obtained")
        .in("exam_id", examIds);

      const perStudent = new Map<string, number[]>();
      for (const r of results ?? []) {
        const total = totalsByExam.get(r.exam_id) ?? 100;
        const pct = total ? (Number(r.marks_obtained) / total) * 100 : 0;
        const list = perStudent.get(r.student_id) ?? [];
        list.push(pct);
        perStudent.set(r.student_id, list);
      }

      let sumAll = 0;
      let countAll = 0;
      for (const pcts of perStudent.values()) {
        const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
        gradeCounts[percentageToGrade(avg)]++;
        sumAll += avg;
        countAll++;
      }
      averageResultPct = countAll ? Math.round((sumAll / countAll) * 10) / 10 : 0;
    }
  }

  return {
    totalStudents: totalStudents ?? 0,
    totalTeachers: totalTeachers ?? 0,
    totalClasses: totalClasses ?? 0,
    todayAttendancePct: todayPct,
    pendingFeesTotal,
    feeCollected,
    feeExpected,
    upcomingExams,
    averageResultPct,
    attendanceTrend: days,
    gradeDistribution: [
      { grade: "A+ / A", count: gradeCounts["A+"] + gradeCounts["A"] },
      { grade: "B", count: gradeCounts["B"] },
      { grade: "C", count: gradeCounts["C"] },
      { grade: "D", count: gradeCounts["D"] },
      { grade: "F", count: gradeCounts["F"] },
    ],
  };
}
