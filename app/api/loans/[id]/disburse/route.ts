import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { disburseLoanSchema } from "@/lib/loan/validation";
import { generateRepaymentSchedule } from "@/lib/loan/repaymentSchedule";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(["FINANCE", "ADMIN"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = disburseLoanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  if (loan.loanStatus !== "APPROVED") {
    return NextResponse.json({ error: `Only APPROVED loans can be disbursed (current status: ${loan.loanStatus}).` }, { status: 409 });
  }
  if (loan.signedAgreementStatus !== "VERIFIED") {
    return NextResponse.json(
      { error: "The signed loan agreement must be uploaded and verified before disbursement." },
      { status: 409 }
    );
  }
  if (!loan.approvedAmount || !loan.monthlyInstalment || !loan.numberOfInstalments || !loan.firstPaymentDueDate) {
    return NextResponse.json({ error: "Loan is missing approval terms." }, { status: 409 });
  }

  const schedule = generateRepaymentSchedule({
    approvedAmount: loan.approvedAmount,
    monthlyInstalment: loan.monthlyInstalment,
    numberOfInstalments: loan.numberOfInstalments,
    firstPaymentDueDate: loan.firstPaymentDueDate,
  });

  const result = await prisma.$transaction(async (tx) => {
    const disbursement = await tx.disbursement.create({
      data: {
        loanId: id,
        disbursementDate: data.disbursementDate,
        approvedAmount: loan.approvedAmount!,
        disbursedAmount: data.disbursedAmount,
        paymentMethod: data.paymentMethod,
        bankCashRef: data.bankCashRef,
        voucherNumber: data.voucherNumber,
        authorizedById: user.id,
        notes: data.notes,
      },
    });

    await tx.instalment.createMany({
      data: schedule.map((row) => ({
        loanId: id,
        instalmentNumber: row.instalmentNumber,
        dueDate: row.dueDate,
        amount: row.amount,
        paidAmount: row.paidAmount,
        balance: row.balance,
        status: row.status,
      })),
    });

    const updatedLoan = await tx.loan.update({
      where: { id },
      data: {
        disbursementDate: data.disbursementDate,
        loanStatus: "ACTIVE",
        outstandingPrincipal: loan.approvedAmount!,
        outstandingAmount: loan.approvedAmount!,
      },
    });

    await recordAudit(tx, {
      action: "LOAN_DISBURSED",
      userId: user.id,
      loanId: id,
      newValue: { disbursedAmount: data.disbursedAmount, voucherNumber: data.voucherNumber },
    });
    await recordAudit(tx, {
      action: "REPAYMENT_SCHEDULE_GENERATED",
      userId: user.id,
      loanId: id,
      newValue: { instalments: schedule.length },
    });
    await recordAudit(tx, {
      action: "LOAN_STATUS_CHANGED",
      userId: user.id,
      loanId: id,
      previousValue: { loanStatus: "APPROVED" },
      newValue: { loanStatus: "ACTIVE" },
    });

    return { disbursement, loan: updatedLoan };
  });

  return NextResponse.json(result, { status: 201 });
}
