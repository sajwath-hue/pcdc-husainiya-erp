"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { useApiAction } from "../useApiAction";
import type { LoanDetail, CurrentUser } from "../types";

const inputClass = "w-full rounded-md border border-slate-300 px-2 py-1 text-xs";

function PaymentRow({ loan, instalmentId, onDone }: { loan: LoanDetail; instalmentId: string; onDone: () => void }) {
  const { run, loading, error } = useApiAction(onDone);
  const [form, setForm] = useState({ amountPaid: "", paymentMethod: "CASH", receiptNumber: "" });

  return (
    <form
      className="flex flex-wrap items-center gap-1.5 mt-1"
      onSubmit={(e) => {
        e.preventDefault();
        run(`/api/loans/${loan.id}/payments`, {
          method: "POST",
          body: JSON.stringify({ instalmentId, amountPaid: Number(form.amountPaid), paymentMethod: form.paymentMethod, receiptNumber: form.receiptNumber }),
        });
      }}
    >
      <input required type="number" step="0.01" placeholder="Amount" className={`${inputClass} w-24`} value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} />
      <select className={`${inputClass} w-28`} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
        <option value="CASH">Cash</option>
        <option value="BANK_TRANSFER">Bank</option>
        <option value="CHEQUE">Cheque</option>
      </select>
      <input required placeholder="Receipt #" className={`${inputClass} w-24`} value={form.receiptNumber} onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })} />
      <button disabled={loading} className="rounded bg-emerald-700 text-white px-2 py-1 text-xs hover:bg-emerald-800 disabled:opacity-60">
        {loading ? "..." : "Record"}
      </button>
      {error && <span className="text-xs text-red-600 basis-full">{error}</span>}
    </form>
  );
}

export function RepaymentTab({ loan, currentUser, onChanged }: { loan: LoanDetail; currentUser: CurrentUser; onChanged: () => void }) {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const canPay = currentUser.role === "FINANCE" || currentUser.role === "ADMIN";

  if (loan.instalments.length === 0) {
    return <p className="text-sm text-slate-400">Repayment schedule is generated automatically once the loan is disbursed and becomes ACTIVE.</p>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="font-medium text-slate-800 mb-3">திருப்பிச் செலுத்தும் அட்டவணை / Repayment Schedule</h3>
      <table className="min-w-full text-sm">
        <thead className="text-xs text-slate-500 uppercase">
          <tr>
            <th className="text-left py-1.5">#</th>
            <th className="text-left py-1.5">Due Date</th>
            <th className="text-left py-1.5">Amount</th>
            <th className="text-left py-1.5">Paid</th>
            <th className="text-left py-1.5">Balance</th>
            <th className="text-left py-1.5">Status</th>
            <th className="text-left py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {loan.instalments.map((inst) => {
            const payable = !["PAID", "WAIVED", "CANCELLED"].includes(inst.status);
            return (
              <tr key={inst.id} className="border-t border-slate-100 align-top">
                <td className="py-2">{inst.instalmentNumber}</td>
                <td className="py-2">{formatDate(inst.dueDate)}</td>
                <td className="py-2">{formatCurrency(inst.amount)}</td>
                <td className="py-2">{formatCurrency(inst.paidAmount)}</td>
                <td className="py-2">{formatCurrency(inst.balance)}</td>
                <td className="py-2">
                  <StatusBadge status={inst.status} />
                </td>
                <td className="py-2">
                  {canPay && payable && (
                    <>
                      <button onClick={() => setOpenRow(openRow === inst.id ? null : inst.id)} className="text-emerald-700 hover:underline text-xs">
                        {openRow === inst.id ? "Cancel" : "Record Payment"}
                      </button>
                      {openRow === inst.id && (
                        <PaymentRow
                          loan={loan}
                          instalmentId={inst.id}
                          onDone={() => {
                            setOpenRow(null);
                            onChanged();
                          }}
                        />
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
