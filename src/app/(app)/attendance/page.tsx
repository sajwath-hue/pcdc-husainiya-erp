import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { AttendanceForm } from "./AttendanceForm";
import type { ClassRow, Student } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; date?: string }>;
}) {
  const t = getDictionary(await getLocale());
  const { class: classId, date } = await searchParams;
  const selectedDate = date || todayIso();

  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("academic_year_id", selected?.id ?? "")
    .order("class_name");
  const classList = (classes ?? []) as ClassRow[];
  const activeClassId = classId || classList[0]?.id;
  const activeClass = classList.find((c) => c.id === activeClassId);

  let students: Student[] = [];
  const existing = new Map<string, string>();

  if (activeClassId) {
    const { data } = await supabase.from("students").select("*").eq("class_id", activeClassId).order("roll_no");
    students = (data ?? []) as Student[];

    const { data: records } = await supabase
      .from("attendance")
      .select("student_id, status")
      .eq("class_id", activeClassId)
      .eq("date", selectedDate);
    for (const r of records ?? []) existing.set(r.student_id, r.status);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t.nav.dashboard, href: "/dashboard" }, { label: t.nav.attendance }]} />
      <PageHeader title={t.attendance.title} description={t.attendance.subtitle} />

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.common.class}</label>
          <select
            name="class"
            defaultValue={activeClassId ?? ""}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.common.date}</label>
          <input
            type="date"
            name="date"
            defaultValue={selectedDate}
            max={todayIso()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          {t.attendance.load}
        </button>
      </form>

      {classList.length === 0 ? (
        <EmptyState title={t.attendance.noClassesYet} description={t.attendance.addClassBeforeAttendance} />
      ) : !activeClass ? (
        <EmptyState title={t.attendance.classNotFound} />
      ) : students.length === 0 ? (
        <EmptyState title={t.attendance.noStudentsInClass} description={t.attendance.enrollStudentsBody} />
      ) : (
        <AttendanceForm classId={activeClass.id} date={selectedDate} students={students} existing={existing} />
      )}
    </div>
  );
}
