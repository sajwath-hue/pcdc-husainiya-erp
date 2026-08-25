"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { useApiAction } from "../useApiAction";
import type { LoanDetail, CurrentUser } from "../types";

const inputClass = "w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm";

function GenerateNoticeForm({ loan, onDone }: { loan: LoanDetail; onDone: () => void }) {
  const { run, loading, error } = useApiAction(onDone);
  const overdueInstalments = loan.instalments.filter((i) => i.status === "OVERDUE");
  const [instalmentId, setInstalmentId] = useState(overdueInstalments[0]?.id ?? "");
  const [noticeType, setNoticeType] = useState("PAYMENT_REMINDER");

  if (overdueInstalments.length === 0) {
    return <p className="text-sm text-slate-400">No overdue instalment to issue a notice for.</p>;
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(`/api/loans/${loan.id}/notices`, { method: "POST", body: JSON.stringify({ instalmentId, noticeType }) });
      }}
    >
      <select className={inputClass} value={instalmentId} onChange={(e) => setInstalmentId(e.target.value)}>
        {overdueInstalments.map((i) => (
          <option key={i.id} value={i.id}>
            Instalment #{i.instalmentNumber} — due {new Date(i.dueDate).toLocaleDateString()} — balance {i.balance}
          </option>
        ))}
      </select>
      <select className={inputClass} value={noticeType} onChange={(e) => setNoticeType(e.target.value)}>
        <option value="PAYMENT_REMINDER">Payment Reminder</option>
        <option value="SECOND_REMINDER">Second Reminder</option>
        <option value="FINAL_NOTICE">Final Notice (Admin/Board only)</option>
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button disabled={loading} className="rounded-md bg-emerald-700 text-white px-3 py-1.5 text-sm hover:bg-emerald-800 disabled:opacity-60">
        {loading ? "..." : "Generate Payment Reminder Notice"}
      </button>
    </form>
  );
}

function DeliveryForm({ loanId, noticeId, onDone }: { loanId: string; noticeId: string; onDone: () => void }) {
  const { run, loading, error } = useApiAction(onDone);
  const [form, setForm] = useState({ deliveryStatus: "DELIVERED", deliveryMethod: "HAND_DELIVERED", borrowerAcknowledgement: "" });

  return (
    <form
      className="flex flex-wrap items-center gap-1.5 mt-1"
      onSubmit={(e) => {
        e.preventDefault();
        run(`/api/loans/${loanId}/notices/${noticeId}/delivery`, { method: "PATCH", body: JSON.stringify(form) });
      }}
    >
      <select className="rounded border border-slate-300 px-1.5 py-1 text-xs" value={form.deliveryStatus} onChange={(e) => setForm({ ...form, deliveryStatus: e.target.value })}>
        <option value="DELIVERED">Delivered</option>
        <option value="ACKNOWLEDGED">Acknowledged</option>
        <option value="NOT_DELIVERED">Not Delivered</option>
      </select>
      <select className="rounded border border-slate-300 px-1.5 py-1 text-xs" value={form.deliveryMethod} onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value })}>
        <option value="HAND_DELIVERED">Hand Delivered</option>
        <option value="PRINTED">Printed</option>
        <option value="POST">Post</option>
        <option value="EMAIL">Email</option>
        <option value="OTHER">Other</option>
      </select>
      <input placeholder="Acknowledgement note" className="rounded border border-slate-300 px-1.5 py-1 text-xs w-40" value={form.borrowerAcknowledgement} onChange={(e) => setForm({ ...form, borrowerAcknowledgement: e.target.value })} />
      <button disabled={loading} className="rounded bg-slate-700 text-white px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-60">
        {loading ? "..." : "Save"}
      </button>
      {error && <span className="text-xs text-red-600 basis-full">{error}</span>}
    </form>
  );
}

export function NoticesTab({ loan, currentUser, onChanged }: { loan: LoanDetail; currentUser: CurrentUser; onChanged: () => void }) {
  const [openDelivery, setOpenDelivery] = useState<string | null>(null);
  const canGenerate = ["LOAN_OFFICER", "ADMIN", "BOARD"].includes(currentUser.role);

  return (
    <div className="space-y-4">
      {canGenerate && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-medium text-slate-800 mb-2">கட்டண நினைவூட்டல் அறிவிப்பு / Payment Reminder Notice</h3>
          <GenerateNoticeForm loan={loan} onDone={onChanged} />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-medium text-slate-800 mb-3">அறிவிப்பு வரலாறு / Notice History</h3>
        <table className="min-w-full text-sm">
          <thead className="text-xs text-slate-500 uppercase">
            <tr>
              <th className="text-left py-1.5">Notice #</th>
              <th className="text-left py-1.5">Type</th>
              <th className="text-left py-1.5">Date</th>
              <th className="text-left py-1.5">Outstanding</th>
              <th className="text-left py-1.5">Delivery</th>
              <th className="text-left py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {loan.notices.map((n) => (
              <tr key={n.id} className="border-t border-slate-100 align-top">
                <td className="py-2">{n.noticeNumber}</td>
                <td className="py-2">{n.noticeType.replaceAll("_", " ")}</td>
                <td className="py-2">{formatDateTime(n.noticeDate)}</td>
                <td className="py-2">{formatCurrency(n.outstandingAmount)}</td>
                <td className="py-2">
                  <StatusBadge status={n.deliveryStatus} />
                </td>
                <td className="py-2">
                  <div className="flex flex-col gap-1">
                    <div className="space-x-3">
                      <a href={`/api/files/${n.filePath}`} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline text-xs">
                        Preview / Print
                      </a>
                      <a href={`/api/files/${n.filePath}?download=1`} className="text-emerald-700 hover:underline text-xs">
                        Download
                      </a>
                      <button onClick={() => setOpenDelivery(openDelivery === n.id ? null : n.id)} className="text-slate-600 hover:underline text-xs">
                        Record Delivery
                      </button>
                    </div>
                    {openDelivery === n.id && (
                      <DeliveryForm
                        loanId={loan.id}
                        noticeId={n.id}
                        onDone={() => {
                          setOpenDelivery(null);
                          onChanged();
                        }}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {loan.notices.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No notices issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
