import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { rejectLoanSchema } from "@/lib/loan/validation";
import { ROLES_ALLOWED_TO_APPROVE_LOAN } from "@/lib/loan/constants";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(ROLES_ALLOWED_TO_APPROVE_LOAN);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = rejectLoanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  if (loan.loanStatus !== "PENDING") {
    return NextResponse.json({ error: `Only PENDING loans can be rejected (current status: ${loan.loanStatus}).` }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.loan.update({ where: { id }, data: { loanStatus: "REJECTED" } });
    await recordAudit(tx, {
      action: "LOAN_REJECTED",
      userId: user.id,
      loanId: id,
      previousValue: { loanStatus: "PENDING" },
      newValue: { loanStatus: "REJECTED", reason: parsed.data.reason },
    });
    return result;
  });

  return NextResponse.json(updated);
}
