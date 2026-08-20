const COLORS: Record<string, string> = {
  "A+ / A": "bg-emerald-500",
  B: "bg-blue-500",
  C: "bg-amber-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};

export function GradeDistribution({ data }: { data: { grade: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.grade} className="flex items-center gap-3 text-sm">
          <span className="w-16 shrink-0 font-medium text-slate-600">{d.grade}</span>
          <div className="h-2.5 flex-1 rounded-full bg-slate-100">
            <div
              className={`h-2.5 rounded-full ${COLORS[d.grade] ?? "bg-slate-400"}`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right font-medium text-slate-700">{d.count}</span>
        </div>
      ))}
    </div>
  );
}
