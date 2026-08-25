"use client";

import { formatDateTime } from "@/lib/format";
import type { LoanDetail } from "../types";

function tryParse(value: string | null): string {
  if (!value) return "-";
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return value;
  }
}

export function AuditTab({ loan }: { loan: LoanDetail }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="font-medium text-slate-800 mb-3">தணிக்கை வரலாறு / Audit History</h3>
      <p className="text-xs text-slate-400 mb-3">Append-only — records here are never edited or deleted by the application.</p>
      <table className="min-w-full text-sm">
        <thead className="text-xs text-slate-500 uppercase">
          <tr>
            <th className="text-left py-1.5">When</th>
            <th className="text-left py-1.5">Action</th>
            <th className="text-left py-1.5">User</th>
            <th className="text-left py-1.5">Previous</th>
            <th className="text-left py-1.5">New</th>
          </tr>
        </thead>
        <tbody>
          {loan.auditLogs.map((log) => (
            <tr key={log.id} className="border-t border-slate-100 align-top">
              <td className="py-2 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
              <td className="py-2 font-medium">{log.action.replaceAll("_", " ")}</td>
              <td className="py-2">{log.user?.name ?? "System"}</td>
              <td className="py-2 max-w-xs truncate text-xs text-slate-500">{tryParse(log.previousValue)}</td>
              <td className="py-2 max-w-xs truncate text-xs text-slate-500">{tryParse(log.newValue)}</td>
            </tr>
          ))}
          {loan.auditLogs.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-slate-400">
                No audit records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
