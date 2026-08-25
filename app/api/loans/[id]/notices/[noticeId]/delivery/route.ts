import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/loan/audit";
import { recordDeliverySchema } from "@/lib/loan/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; noticeId: string }> }) {
  let user;
  try {
    user = await requireUser(["LOAN_OFFICER", "ADMIN", "BOARD"]);
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id, noticeId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = recordDeliverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
  if (!notice || notice.loanId !== id) return NextResponse.json({ error: "Notice not found." }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.notice.update({
      where: { id: noticeId },
      data: {
        deliveryStatus: data.deliveryStatus,
        deliveryMethod: data.deliveryMethod ?? notice.deliveryMethod,
        deliveredDate: data.deliveredDate ?? (data.deliveryStatus !== "NOT_DELIVERED" ? new Date() : notice.deliveredDate),
        borrowerAcknowledgement: data.borrowerAcknowledgement ?? notice.borrowerAcknowledgement,
        notes: data.notes ?? notice.notes,
      },
    });

    await recordAudit(tx, {
      action: data.deliveryStatus === "ACKNOWLEDGED" ? "NOTICE_ACKNOWLEDGED" : "NOTICE_DELIVERED",
      userId: user.id,
      loanId: id,
      previousValue: { deliveryStatus: notice.deliveryStatus },
      newValue: { deliveryStatus: result.deliveryStatus, deliveryMethod: result.deliveryMethod },
    });

    return result;
  });

  return NextResponse.json(updated);
}
