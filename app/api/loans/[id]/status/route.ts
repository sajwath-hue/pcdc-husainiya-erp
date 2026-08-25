import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { changeLoanStatusSchema } from "@/lib/loan/validation";
import { ROLES_ALLOWED_TO_DEFAULT } from "@/lib/loan/constants";

/**
 * Manual, serious status changes (spec section 8 & 17): only ADMIN/BOARD
 * may move a loan to DEFAULTED, CANCELLED, or force-COMPLETE it. Everyday
 * transitions (approve/reject/disburse/auto-complete on final payment) go
 * through their own dedicated endpoints instead of this one.
 */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(ROLES_ALLOWED_TO_DEFAULT);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = changeLoanStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.loan.update({ where: { id }, data: { loanStatus: data.status } });
    await recordAudit(tx, {
      action: "LOAN_STATUS_CHANGED",
      userId: user.id,
      loanId: id,
      previousValue: { loanStatus: loan.loanStatus },
      newValue: { loanStatus: data.status, reason: data.reason },
    });
    return result;
  });

  return NextResponse.json(updated);
}
