const COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  DISBURSED: "bg-indigo-100 text-indigo-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-slate-200 text-slate-700",
  DEFAULTED: "bg-red-200 text-red-900",
  CANCELLED: "bg-slate-200 text-slate-500",

  NOT_GENERATED: "bg-slate-100 text-slate-500",
  GENERATED: "bg-blue-100 text-blue-800",
  AWAITING_SIGNATURE: "bg-amber-100 text-amber-800",
  SIGNED: "bg-blue-100 text-blue-800",
  UPLOADED: "bg-indigo-100 text-indigo-800",
  VERIFIED: "bg-emerald-100 text-emerald-800",

  UPCOMING: "bg-slate-100 text-slate-600",
  DUE: "bg-amber-100 text-amber-800",
  PARTIALLY_PAID: "bg-orange-100 text-orange-800",
  PAID: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-red-100 text-red-800",
  WAIVED: "bg-purple-100 text-purple-800",

  NOT_DELIVERED: "bg-slate-100 text-slate-500",
  DELIVERED: "bg-blue-100 text-blue-800",
  ACKNOWLEDGED: "bg-emerald-100 text-emerald-800",

  PENDING_VERIFICATION: "bg-amber-100 text-amber-800",
};

export function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
