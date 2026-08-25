import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { validateAgreementUpload } from "@/lib/upload";
import { saveFile, extensionFor } from "@/lib/storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }
  const { id } = await context.params;
  const docs = await prisma.signedAgreement.findMany({
    where: { loanId: id },
    orderBy: { uploadedAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true } },
      verifiedBy: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(docs);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser(["LOAN_OFFICER", "FINANCE", "ADMIN"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  if (loan.agreementStatus !== "GENERATED") {
    return NextResponse.json({ error: "Generate the Loan Agreement before uploading a signed copy." }, { status: 409 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  const validationError = validateAgreementUpload(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storedName = `${Date.now()}-${extensionFor(file.type)}.${extensionFor(file.type)}`;
  const relativePath = await saveFile(`signed-agreements/${loan.id}`, storedName, buffer);

  const created = await prisma.$transaction(async (tx) => {
    // Never delete the previous signed agreement — mark it superseded and keep it for audit.
    await tx.signedAgreement.updateMany({ where: { loanId: id, isCurrent: true }, data: { isCurrent: false } });

    const doc = await tx.signedAgreement.create({
      data: {
        loanId: id,
        fileName: file.name,
        fileType: file.type,
        filePath: relativePath,
        uploadedById: user.id,
        isCurrent: true,
      },
    });

    const isReplace = await tx.signedAgreement.count({ where: { loanId: id } });

    await tx.loan.update({ where: { id }, data: { signedAgreementStatus: "UPLOADED" } });

    await recordAudit(tx, {
      action: isReplace > 1 ? "AGREEMENT_REPLACED" : "AGREEMENT_UPLOADED",
      userId: user.id,
      loanId: id,
      newValue: { fileName: file.name, fileType: file.type },
    });

    return doc;
  });

  return NextResponse.json(created, { status: 201 });
}
