import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatPKR(amount: number) {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Supabase's typed client can infer a to-one embedded relation as either an
 *  object or a single-item array depending on schema info it doesn't have
 *  here (we use `Database = any`) — this handles both shapes safely. */
export function extractTotalMarks(examsField: unknown): number {
  const row = Array.isArray(examsField) ? examsField[0] : examsField;
  const totalMarks = (row as { total_marks?: number } | null | undefined)?.total_marks;
  return Number(totalMarks) || 100;
}

export function percentageToGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export function gradeBand(grade: string): "A+ / A" | "B" | "C" | "D" | "F" {
  if (grade === "A+" || grade === "A") return "A+ / A";
  if (grade === "B") return "B";
  if (grade === "C") return "C";
  if (grade === "D") return "D";
  return "F";
}

export const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-600",
  inactive: "bg-slate-100 text-slate-500",
  present: "bg-emerald-50 text-emerald-600",
  absent: "bg-red-50 text-red-600",
  late: "bg-amber-50 text-amber-600",
  leave: "bg-sky-50 text-sky-600",
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  overdue: "bg-red-50 text-red-600",
  open: "bg-emerald-50 text-emerald-600",
  locked: "bg-slate-100 text-slate-500",
};
