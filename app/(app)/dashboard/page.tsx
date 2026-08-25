import { prisma } from "@/lib/db";
import { syncAllActiveLoanInstalments } from "@/lib/loan/sync";
import { isReminderRequired, getReminderThresholdDays, daysOverdueFrom } from "@/lib/loan/overdue";
import { formatCurrency } from "@/lib/format";
import { TL } from "@/components/BilingualLabel";

async function getStats() {
  await syncAllActiveLoanInstalments();

  const [totalLoans, pending, approved, active, completed, disbursedAgg, paidAgg, outstandingAgg] = await Promise.all([
    prisma.loan.count(),
    prisma.loan.count({ where: { loanStatus: "PENDING" } }),
    prisma.loan.count({ where: { loanStatus: "APPROVED" } }),
    prisma.loan.count({ where: { loanStatus: "ACTIVE" } }),
    prisma.loan.count({ where: { loanStatus: "COMPLETED" } }),
    prisma.disbursement.aggregate({ _sum: { disbursedAmount: true } }),
    prisma.payment.aggregate({ _sum: { amountPaid: true } }),
    prisma.loan.aggregate({ where: { loanStatus: { in: ["ACTIVE", "DISBURSED"] } }, _sum: { outstandingAmount: true } }),
  ]);

  const overdueInstalments = await prisma.instalment.findMany({
    where: { status: "OVERDUE" },
    select: { loanId: true, dueDate: true },
  });
  const threshold = getReminderThresholdDays();
  const now = new Date();
  const overdueLoanIds = new Set(overdueInstalments.map((i) => i.loanId));
  const reminderLoanIds = new Set(
    overdueInstalments
      .filter((i) => isReminderRequired(daysOverdueFrom(i.dueDate, now), threshold))
      .map((i) => i.loanId)
  );

  return {
    totalLoans,
    pending,
    approved,
    active,
    completed,
    totalDisbursed: disbursedAgg._sum.disbursedAmount ?? 0,
    totalRepaid: paidAgg._sum.amountPaid ?? 0,
    totalOutstanding: outstandingAgg._sum.outstandingAmount ?? 0,
    overdueLoans: overdueLoanIds.size,
    reminderRequired: reminderLoanIds.size,
  };
}

function Card({ ta, en, value, tone }: { ta: string; en: string; value: string | number; tone?: "danger" | "warn" | "default" }) {
  const toneClass =
    tone === "danger" ? "border-red-200 bg-red-50" : tone === "warn" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <TL ta={ta} en={en} className="text-xs text-slate-500" />
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">
        <TL ta="கடன் மேலாண்மை கண்காணிப்பு பலகை" en="Loan Monitoring Dashboard" />
      </h1>
      <p className="text-sm text-slate-500 mb-6">Overview of all PCDC loan applications and repayments.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card ta="மொத்த கடன்கள்" en="Total Loans" value={stats.totalLoans} />
        <Card ta="நிலுவையிலுள்ள விண்ணப்பங்கள்" en="Pending Applications" value={stats.pending} />
        <Card ta="அங்கீகரிக்கப்பட்ட கடன்கள்" en="Approved Loans" value={stats.approved} />
        <Card ta="செயலில் உள்ள கடன்கள்" en="Active Loans" value={stats.active} />
        <Card ta="முடிக்கப்பட்ட கடன்கள்" en="Completed Loans" value={stats.completed} />
        <Card ta="மொத்த வழங்கப்பட்டது" en="Total Disbursed" value={formatCurrency(stats.totalDisbursed)} />
        <Card ta="மொத்த திருப்பிச் செலுத்தியது" en="Total Repaid" value={formatCurrency(stats.totalRepaid)} />
        <Card ta="மொத்த நிலுவை" en="Total Outstanding" value={formatCurrency(stats.totalOutstanding)} />
        <Card ta="நிலுவைக் கடன்கள்" en="Overdue Loans" value={stats.overdueLoans} tone={stats.overdueLoans > 0 ? "danger" : "default"} />
        <Card
          ta="நினைவூட்டல் தேவை"
          en="Reminder Notices Required"
          value={stats.reminderRequired}
          tone={stats.reminderRequired > 0 ? "warn" : "default"}
        />
      </div>
    </div>
  );
}
