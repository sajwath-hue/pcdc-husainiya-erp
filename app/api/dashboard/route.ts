import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { syncAllActiveLoanInstalments } from "@/lib/loan/sync";
import { isReminderRequired, getReminderThresholdDays, daysOverdueFrom } from "@/lib/loan/overdue";

export async function GET() {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }

  await syncAllActiveLoanInstalments();

  const [totalLoans, pending, approved, active, completed, disbursedAgg, paidAgg, outstandingAgg] = await Promise.all([
    prisma.loan.count(),
    prisma.loan.count({ where: { loanStatus: "PENDING" } }),
    prisma.loan.count({ where: { loanStatus: "APPROVED" } }),
    prisma.loan.count({ where: { loanStatus: "ACTIVE" } }),
    prisma.loan.count({ where: { loanStatus: "COMPLETED" } }),
    prisma.disbursement.aggregate({ _sum: { disbursedAmount: true } }),
    prisma.payment.aggregate({ _sum: { amountPaid: true } }),
    prisma.loan.aggregate({
      where: { loanStatus: { in: ["ACTIVE", "DISBURSED"] } },
      _sum: { outstandingAmount: true },
    }),
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

  return NextResponse.json({
    totalLoans,
    pendingApplications: pending,
    approvedLoans: approved,
    activeLoans: active,
    completedLoans: completed,
    totalDisbursed: disbursedAgg._sum.disbursedAmount ?? 0,
    totalRepaid: paidAgg._sum.amountPaid ?? 0,
    totalOutstanding: outstandingAgg._sum.outstandingAmount ?? 0,
    overdueLoans: overdueLoanIds.size,
    reminderNoticesRequired: reminderLoanIds.size,
  });
}
