import type { Prisma, PrismaClient } from "@prisma/client";
import type { AuditAction } from "./constants";

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Append-only audit log writer. No update/delete for AuditLog is exposed
 * anywhere in the app layer — this is the only way rows get created.
 */
export async function recordAudit(
  tx: Tx,
  params: {
    action: AuditAction;
    userId?: string | null;
    loanId?: string | null;
    previousValue?: unknown;
    newValue?: unknown;
  }
) {
  await tx.auditLog.create({
    data: {
      action: params.action,
      userId: params.userId ?? null,
      loanId: params.loanId ?? null,
      previousValue: params.previousValue === undefined ? null : JSON.stringify(params.previousValue),
      newValue: params.newValue === undefined ? null : JSON.stringify(params.newValue),
    },
  });
}
