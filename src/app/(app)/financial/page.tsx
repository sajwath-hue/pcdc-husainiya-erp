import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FeeDonut } from "@/components/dashboard/FeeDonut";
import { formatPKR } from "@/lib/utils";
import { format, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function FinancialManagementPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  if (!selected) {
    return <EmptyState title={t.financial.noAcademicYearSelected} description={t.financial.noAcademicYearSelectedBody} />;
  }

  const { data: fees } = await supabase
    .from("fees")
    .select("amount, amount_paid, fee_type, status, students(class_id, classes(class_name))")
    .eq("academic_year_id", selected.id);

  type FeeRow = {
    amount: number;
    amount_paid: number;
    fee_type: string;
    status: string;
    students: { class_id: string | null; classes: { class_name: string } | null } | null;
  };
  const rows = (fees ?? []) as unknown as FeeRow[];

  const totalBilled = rows.reduce((s, f) => s + Number(f.amount), 0);
  const totalCollected = rows.reduce((s, f) => s + Number(f.amount_paid), 0);
  const totalOverdue = rows.filter((f) => f.status === "overdue").reduce((s, f) => s + (Number(f.amount) - Number(f.amount_paid)), 0);
  const totalPending = rows.filter((f) => f.status !== "paid").reduce((s, f) => s + (Number(f.amount) - Number(f.amount_paid)), 0);

  const byClass = new Map<string, { billed: number; collected: number }>();
  for (const f of rows) {
    const name = f.students?.classes?.class_name ?? t.common.unassigned;
    const bucket = byClass.get(name) ?? { billed: 0, collected: 0 };
    bucket.billed += Number(f.amount);
    bucket.collected += Number(f.amount_paid);
    byClass.set(name, bucket);
  }

  const byType = new Map<string, number>();
  for (const f of rows) {
    byType.set(f.fee_type, (byType.get(f.fee_type) ?? 0) + Number(f.amount));
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t.nav.dashboard, href: "/dashboard" }, { label: t.nav.financialManagement }]} />
      <PageHeader title={t.financial.title} description={format(t.financial.subtitleForYear, { year: selected.year_label })} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.fees.totalBilled} value={formatPKR(totalBilled)} />
        <StatCard label={t.dashboard.collected} value={formatPKR(totalCollected)} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label={t.dashboard.pending} value={formatPKR(totalPending)} accent="bg-amber-50 text-amber-600" />
        <StatCard label={t.dashboard.overdue} value={formatPKR(totalOverdue)} accent="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">{t.financial.collectionOverview}</h2>
          <FeeDonut collected={totalCollected} pending={Math.max(totalBilled - totalCollected, 0)} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">{t.financial.billedByFeeType}</h2>
          {byType.size === 0 ? (
            <p className="text-sm text-slate-400">{t.studentTabs.noFeeRecords}</p>
          ) : (
            <div className="space-y-3">
              {Array.from(byType.entries()).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{type}</span>
                  <span className="font-medium text-slate-800">{formatPKR(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-800">{t.financial.byClass}</h2>
        {byClass.size === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">{t.studentTabs.noFeeRecords}</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">{t.common.class}</th>
                <th className="px-5 py-3">{t.financial.billed}</th>
                <th className="px-5 py-3">{t.dashboard.collected}</th>
                <th className="px-5 py-3">{t.fees.outstanding}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from(byClass.entries()).map(([name, v]) => (
                <tr key={name}>
                  <td className="px-5 py-3 font-medium text-slate-800">{name}</td>
                  <td className="px-5 py-3">{formatPKR(v.billed)}</td>
                  <td className="px-5 py-3">{formatPKR(v.collected)}</td>
                  <td className="px-5 py-3">{formatPKR(v.billed - v.collected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
