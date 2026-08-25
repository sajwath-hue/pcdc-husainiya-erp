import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { syncLoanInstalments } from "@/lib/loan/sync";
import { isLoanReminderRequired } from "@/lib/loan/overdue";
import { getCurrentUser } from "@/lib/auth/session";
import { LoanProfile } from "@/components/loan/LoanProfile";

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const existing = await prisma.loan.findUnique({ where: { id } });
  if (!existing) notFound();

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

  if (!loan) notFound();

  const reminderRequired = isLoanReminderRequired(loan.instalments);

  return <LoanProfile loan={JSON.parse(JSON.stringify({ ...loan, reminderRequired }))} currentUser={user} />;
}
