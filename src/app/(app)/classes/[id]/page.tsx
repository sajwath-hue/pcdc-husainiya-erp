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

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    { label: "Teachers", desc: "Faculty and subject assignments", href: `/teachers?class=${id}` },
    { label: "Students", desc: "Profiles, enrollment and records", href: `/students?class=${id}` },
    { label: "Attendance", desc: "Daily marking and history", href: `/attendance?class=${id}` },
    { label: "Exams & Results", desc: "Assessments, marks and grades", href: `/exams?class=${id}` },
    { label: "Assignments", desc: "Classwork and submissions", href: `/assignments?class=${id}` },
    { label: "Fees", desc: "Payments for this class", href: `/fees?class=${id}` },
    { label: "Timetable", desc: "Weekly schedule", href: `/timetable?class=${id}` },
    { label: "Reports", desc: "Academic insights", href: `/reports?class=${id}` },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Classes", href: "/classes" },
          { label: classRow.class_name },
        ]}
      />

      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{classRow.class_name.toUpperCase()}</h1>
            <p className="mt-1 text-sm text-blue-100">
              Academic Year: {(year as AcademicYear | null)?.year_label ?? "—"} · Room {classRow.room || "—"}
            </p>
          </div>
          <Badge tone={classRow.status} className="bg-white/15 text-white">
            {classRow.status === "active" ? "Active Class" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Total Teachers" value={stats.totalTeachers} icon={UserRound} accent="bg-violet-50 text-violet-600" />
        <StatCard label="Today's Attendance" value={`${stats.todayAttendancePct}%`} icon={CalendarCheck} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Average Attendance" value={`${stats.avgAttendancePct}%`} icon={TrendingUp} accent="bg-teal-50 text-teal-600" />
        <StatCard label="Average Result" value={`${stats.avgResultPct}%`} icon={Award} accent="bg-amber-50 text-amber-600" />
        <StatCard label="Pending Fees" value={formatPKR(stats.pendingFees)} icon={Wallet} accent="bg-rose-50 text-rose-600" />
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Class Management</h2>
        <p className="mb-4 text-sm text-slate-500">Everything you need to manage {classRow.class_name}</p>
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
          <h2 className="text-sm font-semibold text-slate-800">Assigned Teachers</h2>
        </div>
        {assignedTeachers.length > 0 ? (
          <ul className="mb-3 flex flex-wrap gap-2">
            {assignedTeachers.map((t) => (
              <li key={t.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {t.full_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-slate-400">No teachers assigned yet.</p>
        )}
        <AssignTeachers classId={id} allTeachers={(allTeachers ?? []) as Teacher[]} assignedIds={assignedIds} />
      </div>
    </div>
  );
}
