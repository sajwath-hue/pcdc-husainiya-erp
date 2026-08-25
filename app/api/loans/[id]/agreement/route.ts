import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { renderLoanAgreementPdf } from "@/lib/pdf/loanAgreement";
import { saveFile } from "@/lib/storage";

const GENERATABLE_STATUSES = new Set(["APPROVED", "DISBURSED", "ACTIVE", "COMPLETED"]);

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }
  const { id } = await context.params;
  const agreements = await prisma.loanAgreement.findMany({ where: { loanId: id }, orderBy: { version: "desc" } });
  return NextResponse.json(agreements);
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(["LOAN_OFFICER", "ADMIN"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const loan = await prisma.loan.findUnique({ where: { id }, include: { agreements: true } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  if (!GENERATABLE_STATUSES.has(loan.loanStatus)) {
    return NextResponse.json(
      { error: "Loan Agreement can only be generated after the loan is APPROVED." },
      { status: 409 }
    );
  }
  if (!loan.approvedAmount || !loan.monthlyInstalment || !loan.numberOfInstalments || !loan.firstPaymentDueDate) {
    return NextResponse.json({ error: "Loan is missing approval terms required to generate the agreement." }, { status: 409 });
  }

  const org = (await prisma.orgSettings.findUnique({ where: { id: "default" } })) ?? {
    orgName: "Husainiya PCDC",
    orgNameTamil: "ஹுசைனியா PCDC",
    address: "",
  };

  const version = loan.agreements.length + 1;
  const agreementDate = new Date();

  const pdfBuffer = await renderLoanAgreementPdf({
    orgName: org.orgName,
    orgNameTamil: org.orgNameTamil,
    orgAddress: org.address,
    loanReferenceNumber: loan.loanReferenceNumber ?? "",
    borrowerName: loan.applicantName,
    nic: loan.nic,
    address: loan.address,
    contactNumber: loan.contactNumber,
    approvedAmount: loan.approvedAmount,
    monthlyInstalment: loan.monthlyInstalment,
    numberOfInstalments: loan.numberOfInstalments,
    firstPaymentDueDate: loan.firstPaymentDueDate,
    agreementDate,
    version,
  });

  const filename = `${loan.loanReferenceNumber ?? loan.id}-agreement-v${version}.pdf`;
  const relativePath = await saveFile(`agreements/${loan.id}`, filename, pdfBuffer);

  const agreement = await prisma.$transaction(async (tx) => {
    await tx.loanAgreement.updateMany({ where: { loanId: id, isCurrent: true }, data: { isCurrent: false } });
    const created = await tx.loanAgreement.create({
      data: {
        loanId: id,
        version,
        filePath: relativePath,
        generatedById: user.id,
        isCurrent: true,
      },
    });
    await tx.loan.update({
      where: { id },
      data: {
        agreementStatus: "GENERATED",
        signedAgreementStatus: loan.signedAgreementStatus === "NOT_GENERATED" ? "AWAITING_SIGNATURE" : loan.signedAgreementStatus,
      },
    });
    await recordAudit(tx, {
      action: "AGREEMENT_GENERATED",
      userId: user.id,
      loanId: id,
      newValue: { version, filePath: relativePath },
    });
    return created;
  });

  return NextResponse.json(agreement, { status: 201 });
}
