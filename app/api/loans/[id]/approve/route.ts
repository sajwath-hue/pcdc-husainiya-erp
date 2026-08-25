import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { approveLoanSchema } from "@/lib/loan/validation";
import { generateLoanReferenceNumber } from "@/lib/loan/referenceNumber";
import { ROLES_ALLOWED_TO_APPROVE_LOAN } from "@/lib/loan/constants";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(ROLES_ALLOWED_TO_APPROVE_LOAN);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = approveLoanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  if (loan.loanStatus !== "PENDING") {
    return NextResponse.json({ error: `Only PENDING loans can be approved (current status: ${loan.loanStatus}).` }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Immutable once assigned: a loan reference number is only ever minted here.
    const loanReferenceNumber = loan.loanReferenceNumber ?? (await generateLoanReferenceNumber(tx));
    const approvalDate = data.approvalDate ?? new Date();

    const result = await tx.loan.update({
      where: { id },
      data: {
        loanReferenceNumber,
        approvedAmount: data.approvedAmount,
        monthlyInstalment: data.monthlyInstalment,
        numberOfInstalments: data.numberOfInstalments,
        firstPaymentDueDate: data.firstPaymentDueDate,
        approvalDate,
        outstandingPrincipal: data.approvedAmount,
        outstandingAmount: data.approvedAmount,
        loanStatus: "APPROVED",
        approvedById: user.id,
      },
    });

    await recordAudit(tx, {
      action: "LOAN_APPROVED",
      userId: user.id,
      loanId: id,
      previousValue: { loanStatus: "PENDING" },
      newValue: { loanStatus: "APPROVED", loanReferenceNumber, approvedAmount: data.approvedAmount },
    });

    return result;
  });

  return NextResponse.json(updated);
}
