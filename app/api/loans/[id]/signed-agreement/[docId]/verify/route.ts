import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { verifyAgreementSchema } from "@/lib/loan/validation";
import { ROLES_ALLOWED_TO_VERIFY_DOCUMENTS } from "@/lib/loan/constants";

export async function POST(request: Request, context: { params: Promise<{ id: string; docId: string }> }) {
  let user;
  try {
    user = await requireUser(ROLES_ALLOWED_TO_VERIFY_DOCUMENTS);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id, docId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = verifyAgreementSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const doc = await prisma.signedAgreement.findUnique({ where: { id: docId } });
  if (!doc || doc.loanId !== id) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (!doc.isCurrent) {
    return NextResponse.json({ error: "Only the current signed agreement can be verified." }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.signedAgreement.update({
      where: { id: docId },
      data: {
        verificationStatus: parsed.data.verified ? "VERIFIED" : "REJECTED",
        verifiedById: user.id,
        verifiedAt: new Date(),
      },
    });

    await tx.loan.update({
      where: { id },
      data: { signedAgreementStatus: parsed.data.verified ? "VERIFIED" : "UPLOADED" },
    });

    await recordAudit(tx, {
      action: "AGREEMENT_VERIFIED",
      userId: user.id,
      loanId: id,
      previousValue: { verificationStatus: doc.verificationStatus },
      newValue: { verificationStatus: result.verificationStatus, notes: parsed.data.notes },
    });

    return result;
  });

  return NextResponse.json(updated);
}
