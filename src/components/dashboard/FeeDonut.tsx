"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatPKR } from "@/lib/utils";

export function FeeDonut({
  collected,
  pending,
}: {
  collected: number;
  pending: number;
}) {
  const total = collected + pending;
  const pct = total ? Math.round((collected / total) * 100) : 0;
  const data =
    total > 0
      ? [
          { name: "Collected", value: collected },
          { name: "Pending", value: pending },
        ]
      : [{ name: "No fee records", value: 1 }];
  const colors = total > 0 ? ["#10b981", "#f59e0b"] : ["#e2e8f0"];

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={45} outerRadius={62} startAngle={90} endAngle={-270}>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={colors[i % colors.length]} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-slate-900">{pct}%</span>
          <span className="text-[10px] text-slate-500">Collected</span>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Collected{" "}
          <span className="font-medium text-slate-700">{formatPKR(collected)}</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending{" "}
          <span className="font-medium text-slate-700">{formatPKR(pending)}</span>
        </p>
      </div>
    </div>
  );
}
