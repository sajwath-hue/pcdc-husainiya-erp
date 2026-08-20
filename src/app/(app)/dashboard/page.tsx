import Link from "next/link";
import {
  Users,
  UserRound,
  School,
  CalendarCheck,
  Wallet,
  FileText,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { getDashboardStats } from "@/lib/data/dashboard";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/PageHeader";
import { AttendanceTrendChart } from "@/components/dashboard/AttendanceTrendChart";
import { FeeDonut } from "@/components/dashboard/FeeDonut";
import { GradeDistribution } from "@/components/dashboard/GradeDistribution";
import { formatPKR } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const { data: profile } = userRes.user
    ? await supabase.from("profiles").select("full_name").eq("id", userRes.user.id).maybeSingle()
    : { data: null };

  const { years, selected } = await getAcademicYearContext();

  if (years.length === 0) {
    return (
      <EmptyState
        title="Welcome to Manbaul Huda Arabic College ERP"
        description="Start by creating your first academic year — everything else (classes, students, fees) is organized under it."
        action={
          <Link
            href="/academic-years/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Academic Year
          </Link>
        }
      />
    );
  }

  const stats = await getDashboardStats(supabase, selected?.id ?? null);
  const firstName = (profile?.full_name || userRes.user?.email || "there").split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Good morning, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is what is happening across Manbaul Huda Arabic College today.
          </p>
        </div>
        <Link
          href="/classes/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add New Class
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Total Teachers" value={stats.totalTeachers} icon={UserRound} accent="bg-violet-50 text-violet-600" />
        <StatCard label="Total Classes" value={stats.totalClasses} icon={School} accent="bg-teal-50 text-teal-600" />
        <StatCard
          label="Today's Attendance"
          value={`${stats.todayAttendancePct}%`}
          icon={CalendarCheck}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Pending Fees"
          value={formatPKR(stats.pendingFeesTotal)}
          icon={Wallet}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard label="Upcoming Exams" value={stats.upcomingExams} icon={FileText} accent="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Attendance Trend</h2>
            <span className="text-sm font-semibold text-blue-600">{stats.todayAttendancePct}%</span>
          </div>
          <p className="mb-2 text-xs text-slate-500">Latest seven recorded school days</p>
          <AttendanceTrendChart data={stats.attendanceTrend} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">Fee Collection</h2>
          <p className="mb-4 text-xs text-slate-500">Academic-year payment position</p>
          <FeeDonut collected={stats.feeCollected} pending={Math.max(stats.feeExpected - stats.feeCollected, 0)} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">Grade Distribution</h2>
          <p className="mb-4 text-xs text-slate-500">
            Current student academic averages ({stats.averageResultPct}% avg)
          </p>
          <GradeDistribution data={stats.gradeDistribution} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Classes", href: "/classes" },
            { label: "Students", href: "/students" },
            { label: "Teachers", href: "/teachers" },
            { label: "Attendance", href: "/attendance" },
            { label: "Exams & Results", href: "/exams" },
            { label: "Fees", href: "/fees" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
