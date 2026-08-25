import { prisma } from "@/lib/db";
import { computeInstalmentStatus } from "./overdue";
import { recordAudit } from "./audit";

const MANUAL_STATUSES = new Set(["WAIVED", "CANCELLED"]);

/**
 * Recomputes UPCOMING/DUE/PARTIALLY_PAID/PAID/OVERDUE for every instalment
 * of a single loan against "today", persisting any change. WAIVED and
 * CANCELLED instalments (manual overrides) are left untouched. Returns the
 * refreshed instalments.
 *
 * There is no external cron in this environment, so this is invoked
 * on-demand at the top of the read paths that need fresh numbers (loan
 * detail, loan list, dashboard) — cheap, idempotent, and always consistent
 * with "today" at read time.
 */
export async function syncLoanInstalments(loanId: string, today: Date = new Date()) {
  const instalments = await prisma.instalment.findMany({
    where: { loanId },
    orderBy: { instalmentNumber: "asc" },
  });

  for (const inst of instalments) {
    if (MANUAL_STATUSES.has(inst.status)) continue;

    const result = computeInstalmentStatus(inst.dueDate, inst.amount, inst.paidAmount, today);
    const newBalance = Math.max(0, Math.round((inst.amount - inst.paidAmount) * 100) / 100);

    if (result.status !== inst.status || newBalance !== inst.balance) {
      await prisma.instalment.update({
        where: { id: inst.id },
        data: { status: result.status, balance: newBalance },
      });

      if (result.status === "OVERDUE" && inst.status !== "OVERDUE") {
        await recordAudit(prisma, {
          action: "INSTALMENT_MARKED_OVERDUE",
          loanId,
          previousValue: { instalmentNumber: inst.instalmentNumber, status: inst.status },
          newValue: { instalmentNumber: inst.instalmentNumber, status: result.status, daysOverdue: result.daysOverdue },
        });
      }
    }
  }

  return prisma.instalment.findMany({ where: { loanId }, orderBy: { instalmentNumber: "asc" } });
}

/** Recomputes overdue status for every ACTIVE loan's instalments (used by dashboard / loan list). */
export async function syncAllActiveLoanInstalments(today: Date = new Date()) {
  const activeLoans = await prisma.loan.findMany({
    where: { loanStatus: "ACTIVE" },
    select: { id: true },
  });
  for (const loan of activeLoans) {
    await syncLoanInstalments(loan.id, today);
  }
}
