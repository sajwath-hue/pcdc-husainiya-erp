import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { generateApplicantCode } from "@/lib/loan/referenceNumber";

const createBorrowerSchema = z.object({
  name: z.string().min(1),
  nic: z.string().min(1),
  address: z.string().min(1),
  contactNumber: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const borrowers = await prisma.borrower.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { nic: { contains: q } },
            { applicantCode: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(borrowers);
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser(["LOAN_OFFICER", "ADMIN"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }
  void user;

  const body = await request.json().catch(() => null);
  const parsed = createBorrowerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const borrower = await prisma.$transaction(async (tx) => {
    const applicantCode = await generateApplicantCode(tx);
    return tx.borrower.create({ data: { ...parsed.data, applicantCode } });
  });

  return NextResponse.json(borrower, { status: 201 });
}
