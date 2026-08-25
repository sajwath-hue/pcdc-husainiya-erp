"use client";

import { formatCurrency, formatDateTime } from "@/lib/format";
import type { LoanDetail } from "../types";

export function PaymentsTab({ loan }: { loan: LoanDetail }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="font-medium text-slate-800 mb-3">கொடுப்பனவு வரலாறு / Payment History</h3>
      <table className="min-w-full text-sm">
        <thead className="text-xs text-slate-500 uppercase">
          <tr>
            <th className="text-left py-1.5">Date</th>
            <th className="text-left py-1.5">Amount Paid</th>
            <th className="text-left py-1.5">Method</th>
            <th className="text-left py-1.5">Receipt #</th>
            <th className="text-left py-1.5">Reference #</th>
            <th className="text-left py-1.5">Received By</th>
          </tr>
        </thead>
        <tbody>
          {loan.payments.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="py-2">{formatDateTime(p.paymentDate)}</td>
              <td className="py-2">{formatCurrency(p.amountPaid)}</td>
              <td className="py-2">{p.paymentMethod}</td>
              <td className="py-2">{p.receiptNumber}</td>
              <td className="py-2">{p.referenceNumber ?? "-"}</td>
              <td className="py-2">{p.receivedBy.name}</td>
            </tr>
          ))}
          {loan.payments.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No payments recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
