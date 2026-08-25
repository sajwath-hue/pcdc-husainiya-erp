import Link from "next/link";
import { prisma } from "@/lib/db";
import { syncAllActiveLoanInstalments } from "@/lib/loan/sync";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { TL } from "@/components/BilingualLabel";
import { LOAN_STATUS } from "@/lib/loan/constants";

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  await syncAllActiveLoanInstalments();

  const loans = await prisma.loan.findMany({
    where: {
      loanStatus: status || undefined,
      OR: q
        ? [
            { applicantName: { contains: q } },
            { nic: { contains: q } },
            { loanReferenceNumber: { contains: q } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: { instalments: { select: { status: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-slate-900">
          <TL ta="கடன்கள்" en="Loans" />
        </h1>
        <Link href="/loans/new" className="rounded-md bg-emerald-700 text-white text-sm px-3 py-1.5 hover:bg-emerald-800">
          + புதிய விண்ணப்பம் / New Application
        </Link>
      </div>

      <form className="flex flex-wrap gap-2 mb-4" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="பெயர் / NIC / குறிப்பு எண் — Search"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-64"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {LOAN_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Ref No</th>
              <th className="text-left px-4 py-2">Applicant</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Agreement</th>
              <th className="text-left px-4 py-2">Outstanding</th>
              <th className="text-left px-4 py-2">Overdue</th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const overdueCount = loan.instalments.filter((i) => i.status === "OVERDUE").length;
              return (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{loan.loanReferenceNumber ?? "—"}</td>
                  <td className="px-4 py-2">{loan.applicantName}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={loan.loanStatus} />
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={loan.signedAgreementStatus} />
                  </td>
                  <td className="px-4 py-2">{formatCurrency(loan.outstandingAmount)}</td>
                  <td className="px-4 py-2">
                    {overdueCount > 0 ? <span className="text-red-600 font-medium">{overdueCount}</span> : "-"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/loans/${loan.id}`} className="text-emerald-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">{loans.length} loan(s) found.</p>
    </div>
  );
}
