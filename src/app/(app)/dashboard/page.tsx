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
import { format, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

const SCHOOL_NAME = "Manbaul Huda Arabic College";

export default async function DashboardPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const { data: profile } = userRes.user
    ? await supabase.from("profiles").select("full_name").eq("id", userRes.user.id).maybeSingle()
    : { data: null };

  const { years, selected } = await getAcademicYearContext();

  if (years.length === 0) {
    return (
      <EmptyState
        title={format(t.dashboard.welcome, { school: SCHOOL_NAME })}
        description={`${t.dashboard.getStartedTitle} — ${t.dashboard.getStartedBody}`}
        action={
          <Link
            href="/academic-years/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> {t.academicYears.addAcademicYear}
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
          <h1 className="text-2xl font-semibold text-slate-900">
            {format(t.dashboard.goodMorning, { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {format(t.dashboard.subtitleAdmin, { school: SCHOOL_NAME })}
          </p>
        </div>
        <Link
          href="/classes/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} /> {t.dashboard.addNewClass}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={t.dashboard.totalStudents} value={stats.totalStudents} icon={Users} accent="bg-blue-50 text-blue-600" />
        <StatCard label={t.dashboard.totalTeachers} value={stats.totalTeachers} icon={UserRound} accent="bg-violet-50 text-violet-600" />
        <StatCard label={t.dashboard.totalClasses} value={stats.totalClasses} icon={School} accent="bg-teal-50 text-teal-600" />
        <StatCard
          label={t.dashboard.todaysAttendance}
          value={`${stats.todayAttendancePct}%`}
          icon={CalendarCheck}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label={t.dashboard.pendingFees}
          value={formatPKR(stats.pendingFeesTotal)}
          icon={Wallet}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard label={t.dashboard.upcomingExams} value={stats.upcomingExams} icon={FileText} accent="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">{t.dashboard.attendanceTrend}</h2>
            <span className="text-sm font-semibold text-blue-600">{stats.todayAttendancePct}%</span>
          </div>
          <p className="mb-2 text-xs text-slate-500">{t.dashboard.attendanceTrendSubtitle}</p>
          <AttendanceTrendChart data={stats.attendanceTrend} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">{t.dashboard.feeCollection}</h2>
          <p className="mb-4 text-xs text-slate-500">{t.dashboard.feeCollectionSubtitle}</p>
          <FeeDonut collected={stats.feeCollected} pending={Math.max(stats.feeExpected - stats.feeCollected, 0)} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">{t.dashboard.gradeDistribution}</h2>
          <p className="mb-4 text-xs text-slate-500">
            {t.dashboard.gradeDistributionSubtitle} ({stats.averageResultPct}% avg)
          </p>
          <GradeDistribution data={stats.gradeDistribution} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">{t.dashboard.quickLinks}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: t.nav.classes, href: "/classes" },
            { label: t.nav.students, href: "/students" },
            { label: t.nav.teachers, href: "/teachers" },
            { label: t.nav.attendance, href: "/attendance" },
            { label: t.nav.examsResults, href: "/exams" },
            { label: t.nav.fees, href: "/fees" },
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
