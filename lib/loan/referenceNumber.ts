import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Atomically mints the next sequence number for a given counter key
 * (e.g. "LOAN-2026", "NOTICE-2026") using an upsert, so concurrent
 * approvals never collide on the same reference number.
 */
async function nextSequence(tx: Tx, key: string): Promise<number> {
  const counter = await tx.sequenceCounter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return counter.value;
}

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

/** PCDC-LN-2026-0001 — assigned once, at approval, and never changed again. */
export async function generateLoanReferenceNumber(tx: Tx, date: Date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const seq = await nextSequence(tx, `LOAN-${year}`);
  return `PCDC-LN-${year}-${pad4(seq)}`;
}

/** PCDC-NT-2026-0001 for payment reminder / follow-up notices. */
export async function generateNoticeNumber(tx: Tx, date: Date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const seq = await nextSequence(tx, `NOTICE-${year}`);
  return `PCDC-NT-${year}-${pad4(seq)}`;
}

/** APP-0001 for new borrower/applicant profiles. */
export async function generateApplicantCode(tx: Tx): Promise<string> {
  const seq = await nextSequence(tx, "APPLICANT");
  return `APP-${pad4(seq)}`;
}
