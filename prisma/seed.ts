import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Standalone script (run via `tsx`), so it deliberately avoids the `@/lib/*`
// path-aliased modules used by the Next.js app and re-implements the small
// bits of sequence/schedule logic it needs directly against Prisma.

const prisma = new PrismaClient();

async function nextSequence(key: string): Promise<number> {
  const counter = await prisma.sequenceCounter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return counter.value;
}

async function ensureUser(email: string, name: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash("password123", 10);
  return prisma.user.create({ data: { email, name, role, passwordHash } });
}

function monthsFromNow(months: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function main() {
  await prisma.orgSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      orgName: "Husainiya PCDC",
      orgNameTamil: "ஹுசைனியா PCDC",
      address: "No. 12, Masjid Road, Colombo, Sri Lanka",
      contactPhone: "+94 11 234 5678",
      contactEmail: "info@pcdc-husainiya.org",
    },
    update: {},
  });

  const admin = await ensureUser("admin@pcdc.lk", "A. Rahman (Admin)", "ADMIN");
  const officer = await ensureUser("officer@pcdc.lk", "M. Fahima (Loan Officer)", "LOAN_OFFICER");
  const finance = await ensureUser("finance@pcdc.lk", "S. Naseer (Finance)", "FINANCE");
  const board = await ensureUser("board@pcdc.lk", "Board Chair", "BOARD");
  await ensureUser("auditor@pcdc.lk", "Independent Auditor", "AUDITOR");

  console.log("Seeded users (password for all: password123):");
  console.log("  admin@pcdc.lk / officer@pcdc.lk / finance@pcdc.lk / board@pcdc.lk / auditor@pcdc.lk");

  // --- Demo 1: a PENDING application, ready for the Approve workflow ---
  const pendingBorrowerCode = `APP-${String(await nextSequence("APPLICANT")).padStart(4, "0")}`;
  const pendingBorrower = await prisma.borrower.create({
    data: {
      applicantCode: pendingBorrowerCode,
      name: "Fathima Rizvana",
      nic: "199512345V",
      address: "45 Mosque Lane, Kandy",
      contactNumber: "0771234567",
    },
  });
  await prisma.loan.create({
    data: {
      borrowerId: pendingBorrower.id,
      applicantName: pendingBorrower.name,
      nic: pendingBorrower.nic,
      address: pendingBorrower.address,
      contactNumber: pendingBorrower.contactNumber,
      requestedAmount: 150000,
      loanPurpose: "Small business working capital",
      loanStatus: "PENDING",
      createdById: officer.id,
    },
  });

  // --- Demo 2: a fully ACTIVE loan with a genuinely overdue instalment,
  //     so the reminder/overdue workflow is visible immediately after seed ---
  const activeBorrowerCode = `APP-${String(await nextSequence("APPLICANT")).padStart(4, "0")}`;
  const activeBorrower = await prisma.borrower.create({
    data: {
      applicantCode: activeBorrowerCode,
      name: "Mohamed Anwar",
      nic: "198812345V",
      address: "12 Husainiya Road, Colombo 12",
      contactNumber: "0779876543",
    },
  });

  const year = new Date().getFullYear();
  const loanRefSeq = await nextSequence(`LOAN-${year}`);
  const loanReferenceNumber = `PCDC-LN-${year}-${String(loanRefSeq).padStart(4, "0")}`;

  const approvedAmount = 100000;
  const monthlyInstalment = 10000;
  const numberOfInstalments = 10;
  const firstPaymentDueDate = monthsFromNow(-2); // first instalment was due 2 months ago

  const activeLoan = await prisma.loan.create({
    data: {
      loanReferenceNumber,
      borrowerId: activeBorrower.id,
      applicantName: activeBorrower.name,
      nic: activeBorrower.nic,
      address: activeBorrower.address,
      contactNumber: activeBorrower.contactNumber,
      requestedAmount: approvedAmount,
      approvedAmount,
      loanPurpose: "Home repair",
      approvalDate: monthsFromNow(-2),
      disbursementDate: monthsFromNow(-2),
      monthlyInstalment,
      numberOfInstalments,
      firstPaymentDueDate,
      loanStatus: "ACTIVE",
      outstandingPrincipal: approvedAmount - monthlyInstalment, // instalment 1 was paid
      outstandingAmount: approvedAmount - monthlyInstalment,
      agreementStatus: "GENERATED",
      signedAgreementStatus: "VERIFIED",
      createdById: officer.id,
      approvedById: board.id,
    },
  });

  await prisma.disbursement.create({
    data: {
      loanId: activeLoan.id,
      disbursementDate: monthsFromNow(-2),
      approvedAmount,
      disbursedAmount: approvedAmount,
      paymentMethod: "BANK_TRANSFER",
      voucherNumber: "V-0001",
      authorizedById: finance.id,
      notes: "Seed demo disbursement",
    },
  });

  // Instalment 1: due 2 months ago, fully paid.
  const inst1 = await prisma.instalment.create({
    data: {
      loanId: activeLoan.id,
      instalmentNumber: 1,
      dueDate: firstPaymentDueDate,
      amount: monthlyInstalment,
      paidAmount: monthlyInstalment,
      balance: 0,
      status: "PAID",
    },
  });
  await prisma.payment.create({
    data: {
      loanId: activeLoan.id,
      instalmentId: inst1.id,
      paymentDate: firstPaymentDueDate,
      amountPaid: monthlyInstalment,
      paymentMethod: "CASH",
      receiptNumber: "RCPT-0001",
      receivedById: finance.id,
    },
  });

  // Instalment 2: due 1 month ago, unpaid — genuinely OVERDUE past the
  // one-month reminder threshold, to exercise section 7/8 end to end.
  const inst2Due = monthsFromNow(-1);
  await prisma.instalment.create({
    data: {
      loanId: activeLoan.id,
      instalmentNumber: 2,
      dueDate: inst2Due,
      amount: monthlyInstalment,
      paidAmount: 0,
      balance: monthlyInstalment,
      status: "OVERDUE",
    },
  });

  // Remaining instalments: UPCOMING.
  for (let i = 3; i <= numberOfInstalments; i++) {
    const dueDate = new Date(firstPaymentDueDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    await prisma.instalment.create({
      data: {
        loanId: activeLoan.id,
        instalmentNumber: i,
        dueDate,
        amount: monthlyInstalment,
        paidAmount: 0,
        balance: monthlyInstalment,
        status: "UPCOMING",
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      loanId: activeLoan.id,
      userId: admin.id,
      action: "LOAN_CREATED",
      newValue: JSON.stringify({ note: "Seed data for local validation / demo" }),
    },
  });

  console.log(`Seeded demo ACTIVE loan ${loanReferenceNumber} with one OVERDUE instalment (Reminder Required).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
