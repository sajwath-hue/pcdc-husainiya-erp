import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { syncLoanInstalments } from "@/lib/loan/sync";
import { isLoanReminderRequired } from "@/lib/loan/overdue";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;

  const existing = await prisma.loan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Loan not found." }, { status: 404 });

  if (existing.loanStatus === "ACTIVE") {
    await syncLoanInstalments(id);
  }

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      borrower: true,
      createdBy: { select: { id: true, name: true, role: true } },
      approvedBy: { select: { id: true, name: true, role: true } },
      agreements: { orderBy: { version: "desc" } },
      signedAgreements: {
        orderBy: { uploadedAt: "desc" },
        include: {
          uploadedBy: { select: { id: true, name: true } },
          verifiedBy: { select: { id: true, name: true } },
        },
      },
      disbursement: { include: { authorizedBy: { select: { id: true, name: true } } } },
      instalments: { orderBy: { instalmentNumber: "asc" } },
      payments: {
        orderBy: { paymentDate: "desc" },
        include: { receivedBy: { select: { id: true, name: true } } },
      },
      notices: {
        orderBy: { noticeDate: "desc" },
        include: { generatedBy: { select: { id: true, name: true } } },
      },
      auditLogs: { orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, name: true } } } },
    },
  });

  const reminderRequired = isLoanReminderRequired(loan!.instalments);

  return NextResponse.json({ ...loan, reminderRequired });
}
