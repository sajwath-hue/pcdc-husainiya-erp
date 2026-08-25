import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { recordPaymentSchema } from "@/lib/loan/validation";
import { computeInstalmentStatus } from "@/lib/loan/overdue";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }
  const { id } = await context.params;
  const payments = await prisma.payment.findMany({
    where: { loanId: id },
    orderBy: { paymentDate: "desc" },
    include: { receivedBy: { select: { id: true, name: true } } },
  });
  return NextResponse.json(payments);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(["FINANCE", "ADMIN"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = recordPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  if (loan.loanStatus !== "ACTIVE") {
    return NextResponse.json({ error: `Payments can only be recorded against ACTIVE loans (current status: ${loan.loanStatus}).` }, { status: 409 });
  }

  const instalment = await prisma.instalment.findUnique({ where: { id: data.instalmentId } });
  if (!instalment || instalment.loanId !== id) {
    return NextResponse.json({ error: "Instalment not found for this loan." }, { status: 404 });
  }
  if (["PAID", "WAIVED", "CANCELLED"].includes(instalment.status)) {
    return NextResponse.json({ error: `Instalment #${instalment.instalmentNumber} is already ${instalment.status}.` }, { status: 409 });
  }

  const remainingOnInstalment = Math.round((instalment.amount - instalment.paidAmount) * 100) / 100;
  if (data.amountPaid > remainingOnInstalment + 0.01) {
    return NextResponse.json(
      { error: `Amount paid (${data.amountPaid}) exceeds the outstanding balance on this instalment (${remainingOnInstalment}).` },
      { status: 400 }
    );
  }

  const paymentDate = data.paymentDate ?? new Date();

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        loanId: id,
        instalmentId: instalment.id,
        paymentDate,
        amountPaid: data.amountPaid,
        paymentMethod: data.paymentMethod,
        receiptNumber: data.receiptNumber,
        referenceNumber: data.referenceNumber,
        receivedById: user.id,
        notes: data.notes,
      },
    });

    const newPaidAmount = Math.round((instalment.paidAmount + data.amountPaid) * 100) / 100;
    const newBalance = Math.max(0, Math.round((instalment.amount - newPaidAmount) * 100) / 100);
    const { status } = computeInstalmentStatus(instalment.dueDate, instalment.amount, newPaidAmount, paymentDate);

    await tx.instalment.update({
      where: { id: instalment.id },
      data: { paidAmount: newPaidAmount, balance: newBalance, status },
    });

    const newOutstandingPrincipal = Math.max(0, Math.round((loan.outstandingPrincipal - data.amountPaid) * 100) / 100);
    const newOutstandingAmount = Math.max(0, Math.round((loan.outstandingAmount - data.amountPaid) * 100) / 100);

    const remainingInstalments = await tx.instalment.count({
      where: { loanId: id, status: { notIn: ["PAID", "WAIVED", "CANCELLED"] } },
    });

    const loanUpdateData: { outstandingPrincipal: number; outstandingAmount: number; loanStatus?: string } = {
      outstandingPrincipal: newOutstandingPrincipal,
      outstandingAmount: newOutstandingAmount,
    };
    if (remainingInstalments === 0) {
      loanUpdateData.loanStatus = "COMPLETED";
    }

    const updatedLoan = await tx.loan.update({ where: { id }, data: loanUpdateData });

    await recordAudit(tx, {
      action: "PAYMENT_RECORDED",
      userId: user.id,
      loanId: id,
      newValue: {
        instalmentNumber: instalment.instalmentNumber,
        amountPaid: data.amountPaid,
        receiptNumber: data.receiptNumber,
        instalmentStatus: status,
      },
    });

    if (loanUpdateData.loanStatus === "COMPLETED") {
      await recordAudit(tx, {
        action: "LOAN_COMPLETED",
        userId: user.id,
        loanId: id,
        previousValue: { loanStatus: "ACTIVE" },
        newValue: { loanStatus: "COMPLETED" },
      });
    }

    return { payment, loan: updatedLoan };
  });

  return NextResponse.json(result, { status: 201 });
}
