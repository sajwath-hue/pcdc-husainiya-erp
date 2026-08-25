import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { createLoanApplicationSchema } from "@/lib/loan/validation";
import { generateApplicantCode } from "@/lib/loan/referenceNumber";
import { syncAllActiveLoanInstalments } from "@/lib/loan/sync";

export async function GET(request: Request) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }

  await syncAllActiveLoanInstalments();

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

  const loans = await prisma.loan.findMany({
    where: {
      loanStatus: status ?? undefined,
      OR: q
        ? [
            { applicantName: { contains: q } },
            { nic: { contains: q } },
            { loanReferenceNumber: { contains: q } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      instalments: { select: { status: true } },
    },
  });

  return NextResponse.json(loans);
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser(["LOAN_OFFICER", "ADMIN"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const body = await request.json().catch(() => null);
  const parsed = createLoanApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  const loan = await prisma.$transaction(async (tx) => {
    let borrowerId = data.borrowerId;
    if (!borrowerId) {
      const applicantCode = await generateApplicantCode(tx);
      const borrower = await tx.borrower.create({
        data: {
          applicantCode,
          name: data.applicantName,
          nic: data.nic,
          address: data.address,
          contactNumber: data.contactNumber,
        },
      });
      borrowerId = borrower.id;
    }

    const created = await tx.loan.create({
      data: {
        borrowerId,
        applicantName: data.applicantName,
        nic: data.nic,
        address: data.address,
        contactNumber: data.contactNumber,
        requestedAmount: data.requestedAmount,
        loanPurpose: data.loanPurpose,
        loanStatus: "PENDING",
        createdById: user.id,
      },
    });

    await recordAudit(tx, {
      action: "LOAN_CREATED",
      userId: user.id,
      loanId: created.id,
      newValue: { requestedAmount: data.requestedAmount, applicantName: data.applicantName },
    });

    return created;
  });

  return NextResponse.json(loan, { status: 201 });
}
