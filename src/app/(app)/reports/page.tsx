import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { getDashboardStats } from "@/lib/data/dashboard";
import { getClassStats } from "@/lib/data/class-detail";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { AttendanceTrendChart } from "@/components/dashboard/AttendanceTrendChart";
import { GradeDistribution } from "@/components/dashboard/GradeDistribution";
import { formatPKR } from "@/lib/utils";
import type { ClassRow } from "@/lib/types";
import { format, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function ReportsPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  if (!selected) {
    return <EmptyState title={t.financial.noAcademicYearSelected} description={t.financial.noAcademicYearSelectedBody} />;
  }

  const stats = await getDashboardStats(supabase, selected.id);

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("academic_year_id", selected.id)
    .order("class_name");
  const classList = (classes ?? []) as ClassRow[];

  const perClass = await Promise.all(
    classList.map(async (c) => ({ class: c, stats: await getClassStats(supabase, c.id) }))
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t.nav.dashboard, href: "/dashboard" }, { label: t.nav.reports }]} />
      <PageHeader title={t.reports.title} description={format(t.reports.subtitleForYear, { year: selected.year_label })} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.dashboard.totalStudents} value={stats.totalStudents} />
        <StatCard label={t.reports.avgAttendance7d} value={`${stats.todayAttendancePct}%`} />
        <StatCard label={t.reports.avgResult} value={`${stats.averageResultPct}%`} />
        <StatCard label={t.dashboard.pendingFees} value={formatPKR(stats.pendingFeesTotal)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">{t.reports.attendanceTrend7d}</h2>
          <AttendanceTrendChart data={stats.attendanceTrend} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">{t.dashboard.gradeDistribution}</h2>
          <GradeDistribution data={stats.gradeDistribution} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-800">{t.financial.byClass}</h2>
        {perClass.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">{t.reports.noClassesYet}</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">{t.common.class}</th>
                <th className="px-5 py-3">{t.reports.studentsCol}</th>
                <th className="px-5 py-3">{t.reports.avgAttendanceCol}</th>
                <th className="px-5 py-3">{t.reports.avgResultCol}</th>
                <th className="px-5 py-3">{t.dashboard.pendingFees}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {perClass.map(({ class: c, stats: cs }) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/classes/${c.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                      {c.class_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{cs.totalStudents}</td>
                  <td className="px-5 py-3">{cs.avgAttendancePct}%</td>
                  <td className="px-5 py-3">{cs.avgResultPct}%</td>
                  <td className="px-5 py-3">{formatPKR(cs.pendingFees)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
