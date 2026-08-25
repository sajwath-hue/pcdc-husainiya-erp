import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "./session";
import type { Role } from "@/lib/loan/constants";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Throws AuthError(401/403) — use inside a try/catch in route handlers, or via requireRoleOrResponse for a plain-return style. */
export async function requireUser(allowedRoles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Authentication required.", 401);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("You do not have permission to perform this action.", 403);
  }
  return user;
}

export function authErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return null;
}

// Read-only role — Auditor should never be blocked from GET endpoints,
// so most GET routes intentionally omit a role check (any authenticated
// user can view). Write routes pass explicit allowed-role lists.
export const READ_ONLY_ROLE: Role = "AUDITOR";
