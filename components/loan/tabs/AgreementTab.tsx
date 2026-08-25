"use client";

import { formatDateTime } from "@/lib/format";
import { useApiAction } from "../useApiAction";
import type { LoanDetail, CurrentUser } from "../types";

const GENERATABLE_STATUSES = new Set(["APPROVED", "DISBURSED", "ACTIVE", "COMPLETED"]);

export function AgreementTab({ loan, currentUser, onChanged }: { loan: LoanDetail; currentUser: CurrentUser; onChanged: () => void }) {
  const generateAction = useApiAction(onChanged);
  const canGenerate = (currentUser.role === "LOAN_OFFICER" || currentUser.role === "ADMIN") && GENERATABLE_STATUSES.has(loan.loanStatus);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-800">கடன் ஒப்பந்தம் / Loan Agreement</h3>
        {canGenerate && (
          <button
            disabled={generateAction.loading}
            onClick={() => generateAction.run(`/api/loans/${loan.id}/agreement`, { method: "POST" })}
            className="rounded-md bg-emerald-700 text-white px-3 py-1.5 text-sm hover:bg-emerald-800 disabled:opacity-60"
          >
            {generateAction.loading ? "..." : loan.agreements.length > 0 ? "Regenerate" : "Generate Loan Agreement"}
          </button>
        )}
      </div>
      {generateAction.error && <p className="text-xs text-red-600 mb-2">{generateAction.error}</p>}

      {!canGenerate && loan.agreements.length === 0 && (
        <p className="text-sm text-slate-400">
          {loan.loanStatus === "PENDING" ? "The loan must be approved before an agreement can be generated." : "No agreement generated yet."}
        </p>
      )}

      <table className="min-w-full text-sm">
        <thead className="text-xs text-slate-500 uppercase">
          <tr>
            <th className="text-left py-1.5">Version</th>
            <th className="text-left py-1.5">Generated At</th>
            <th className="text-left py-1.5">Current</th>
            <th className="text-left py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {loan.agreements.map((a) => (
            <tr key={a.id} className="border-t border-slate-100">
              <td className="py-2">v{a.version}</td>
              <td className="py-2">{formatDateTime(a.generatedAt)}</td>
              <td className="py-2">{a.isCurrent ? "Yes" : "Superseded"}</td>
              <td className="py-2 space-x-3">
                <a href={`/api/files/${a.filePath}`} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                  Print / View
                </a>
                <a href={`/api/files/${a.filePath}?download=1`} className="text-emerald-700 hover:underline">
                  Download PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
