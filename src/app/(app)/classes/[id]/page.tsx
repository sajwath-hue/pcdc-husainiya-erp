import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, UserRound, CalendarCheck, TrendingUp, Award, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClassStats } from "@/lib/data/class-detail";
import { Breadcrumb } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { formatPKR } from "@/lib/utils";
import { AssignTeachers } from "./AssignTeachers";
import type { AcademicYear, Teacher } from "@/lib/types";
import { format, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = getDictionary(await getLocale());
  const { id } = await params;
  const supabase = await createClient();

  const { data: classRow } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();
  if (!classRow) notFound();

  const { data: year } = await supabase
    .from("academic_years")
    .select("*")
    .eq("id", classRow.academic_year_id)
    .maybeSingle();

  const stats = await getClassStats(supabase, id);

  const { data: allTeachers } = await supabase.from("teachers").select("*").eq("status", "active").order("full_name");
  const { data: assignments } = await supabase.from("teacher_classes").select("teacher_id").eq("class_id", id);
  const assignedIds = (assignments ?? []).map((a) => a.teacher_id);
  const assignedTeachers = (allTeachers ?? []).filter((t) => assignedIds.includes(t.id));

  const links = [
    { label: t.nav.teachers, desc: t.classHub.teachersCardSubtitle, href: `/teachers?class=${id}` },
    { label: t.nav.students, desc: t.classHub.studentsCardSubtitle, href: `/students?class=${id}` },
    { label: t.nav.attendance, desc: t.classHub.attendanceCardSubtitle, href: `/attendance?class=${id}` },
    { label: t.nav.examsResults, desc: t.classHub.examsCardSubtitle, href: `/exams?class=${id}` },
    { label: t.nav.assignments, desc: t.classHub.assignmentsCardSubtitle, href: `/assignments?class=${id}` },
    { label: t.nav.fees, desc: t.classHub.feesCardSubtitle, href: `/fees?class=${id}` },
    { label: t.nav.timetable, desc: t.classHub.timetableCardSubtitle, href: `/timetable?class=${id}` },
    { label: t.nav.reports, desc: t.classHub.reportsCardSubtitle, href: `/reports?class=${id}` },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.classes, href: "/classes" },
          { label: classRow.class_name },
        ]}
      />

      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{classRow.class_name.toUpperCase()}</h1>
            <p className="mt-1 text-sm text-blue-100">
              {t.classHub.academicYear}: {(year as AcademicYear | null)?.year_label ?? "—"} · {t.classHub.room} {classRow.room || "—"}
            </p>
          </div>
          <Badge tone={classRow.status} className="bg-white/15 text-white">
            {classRow.status === "active" ? t.classHub.activeClass : t.classHub.inactiveClass}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={t.classHub.totalStudents} value={stats.totalStudents} icon={Users} accent="bg-blue-50 text-blue-600" />
        <StatCard label={t.classHub.totalTeachers} value={stats.totalTeachers} icon={UserRound} accent="bg-violet-50 text-violet-600" />
        <StatCard label={t.classHub.todaysAttendance} value={`${stats.todayAttendancePct}%`} icon={CalendarCheck} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label={t.classHub.averageAttendance} value={`${stats.avgAttendancePct}%`} icon={TrendingUp} accent="bg-teal-50 text-teal-600" />
        <StatCard label={t.classHub.averageResult} value={`${stats.avgResultPct}%`} icon={Award} accent="bg-amber-50 text-amber-600" />
        <StatCard label={t.dashboard.pendingFees} value={formatPKR(stats.pendingFees)} icon={Wallet} accent="bg-rose-50 text-rose-600" />
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold text-slate-800">{t.classHub.classManagement}</h2>
        <p className="mb-4 text-sm text-slate-500">{format(t.classHub.classManagementSubtitle, { className: classRow.class_name })}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:shadow-md"
            >
              <p className="font-semibold text-slate-800">{l.label}</p>
              <p className="mt-1 text-xs text-slate-500">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">{t.classHub.assignedTeachers}</h2>
        </div>
        {assignedTeachers.length > 0 ? (
          <ul className="mb-3 flex flex-wrap gap-2">
            {assignedTeachers.map((teacher) => (
              <li key={teacher.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {teacher.full_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-slate-400">{t.classHub.noTeachersAssignedYet}</p>
        )}
        <AssignTeachers classId={id} allTeachers={(allTeachers ?? []) as Teacher[]} assignedIds={assignedIds} />
      </div>
    </div>
  );
}
