import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return authErrorResponse(err)!;
  }

  const { id } = await context.params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const canRead = notification.userId === user.id || (notification.userId === null && (user.role === "ADMIN" || user.role === "BOARD"));
  if (!canRead) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json(updated);
}
