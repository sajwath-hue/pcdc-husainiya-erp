import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { generateNoticeSchema } from "@/lib/loan/validation";
import { generateNoticeNumber } from "@/lib/loan/referenceNumber";
import { renderNoticePdf } from "@/lib/pdf/noticeDocument";
import { saveFile } from "@/lib/storage";
import { computeInstalmentStatus } from "@/lib/loan/overdue";
import { ROLES_ALLOWED_TO_ISSUE_FINAL_NOTICE } from "@/lib/loan/constants";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }
  const { id } = await context.params;
  const notices = await prisma.notice.findMany({
    where: { loanId: id },
    orderBy: { noticeDate: "desc" },
    include: { generatedBy: { select: { id: true, name: true } } },
  });
  return NextResponse.json(notices);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(["LOAN_OFFICER", "ADMIN", "BOARD"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = generateNoticeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.noticeType === "FINAL_NOTICE" && !ROLES_ALLOWED_TO_ISSUE_FINAL_NOTICE.includes(user.role)) {
    return NextResponse.json({ error: "Only Admin/Board can issue a Final Notice." }, { status: 403 });
  }

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });

  const instalment = await prisma.instalment.findUnique({ where: { id: data.instalmentId } });
  if (!instalment || instalment.loanId !== id) {
    return NextResponse.json({ error: "Instalment not found for this loan." }, { status: 404 });
  }

  const overdue = computeInstalmentStatus(instalment.dueDate, instalment.amount, instalment.paidAmount);
  if (overdue.status !== "OVERDUE") {
    return NextResponse.json(
      { error: "A reminder notice can only be generated for an OVERDUE instalment." },
      { status: 409 }
    );
  }

  const org = (await prisma.orgSettings.findUnique({ where: { id: "default" } })) ?? {
    orgName: "Husainiya PCDC",
    orgNameTamil: "ஹுசைனியா PCDC",
    address: "",
  };

  const outstandingAmount = Math.round((loan.outstandingAmount) * 100) / 100;

  const { noticeNumber, pdfBuffer } = await (async () => {
    const number = await prisma.$transaction((tx) => generateNoticeNumber(tx));
    const buffer = await renderNoticePdf({
      orgName: org.orgName,
      orgNameTamil: org.orgNameTamil,
      orgAddress: org.address,
      noticeNumber: number,
      noticeType: data.noticeType,
      noticeDate: new Date(),
      borrowerName: loan.applicantName,
      nic: loan.nic,
      address: loan.address,
      contactNumber: loan.contactNumber,
      loanReferenceNumber: loan.loanReferenceNumber ?? "",
      approvedAmount: loan.approvedAmount ?? 0,
      disbursedAmount: loan.disbursementDate ? loan.approvedAmount : null,
      monthlyInstalment: loan.monthlyInstalment ?? 0,
      dueDate: instalment.dueDate,
      missedInstalmentAmount: overdue.outstandingInstalmentAmount,
      outstandingAmount,
      daysOverdue: overdue.daysOverdue,
    });
    return { noticeNumber: number, pdfBuffer: buffer };
  })();

  const filename = `${noticeNumber}.pdf`;
  const relativePath = await saveFile(`notices/${loan.id}`, filename, pdfBuffer);

  const notice = await prisma.$transaction(async (tx) => {
    const created = await tx.notice.create({
      data: {
        loanId: id,
        noticeNumber,
        noticeType: data.noticeType,
        reason: data.reason ?? `Missed instalment #${instalment.instalmentNumber} due ${instalment.dueDate.toDateString()}`,
        outstandingAmount,
        filePath: relativePath,
        generatedById: user.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: null,
        loanId: id,
        type: "PAYMENT_REMINDER_NOTICE",
        message: `Payment reminder required for Loan ${loan.loanReferenceNumber ?? loan.id}.`,
      },
    });

    await recordAudit(tx, {
      action: "NOTICE_GENERATED",
      userId: user.id,
      loanId: id,
      newValue: { noticeNumber, noticeType: data.noticeType, outstandingAmount },
    });

    return created;
  });

  return NextResponse.json(notice, { status: 201 });
}
