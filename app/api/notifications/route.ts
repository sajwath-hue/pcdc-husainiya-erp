import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";

// Broadcast notifications (userId = null) are visible to Admin/Board, the
// roles responsible for acting on reminder/overdue signals (spec section
// 15/17). Everyone else only sees notifications addressed to them.
export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const canSeeBroadcast = user.role === "ADMIN" || user.role === "BOARD";

  const notifications = await prisma.notification.findMany({
    where: canSeeBroadcast ? { OR: [{ userId: user.id }, { userId: null }] } : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}
