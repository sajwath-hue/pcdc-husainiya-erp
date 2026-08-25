"use client";

import { useState } from "react";
import { TLStack } from "@/components/BilingualLabel";
import { formatDate, formatDateTime } from "@/lib/format";
import { useApiAction } from "../useApiAction";
import type { LoanDetail, CurrentUser } from "../types";
import { ROLES_ALLOWED_TO_APPROVE_LOAN, ROLES_ALLOWED_TO_DEFAULT } from "@/lib/loan/constants";

const inputClass = "w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm";

function Row({ ta, en, value }: { ta: string; en: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm">
      <TLStack ta={ta} en={en} className="text-slate-500" />
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function ApproveForm({ loanId, onChanged }: { loanId: string; onChanged: () => void }) {
  const { run, loading, error } = useApiAction(onChanged);
  const [form, setForm] = useState({ approvedAmount: "", monthlyInstalment: "", numberOfInstalments: "", firstPaymentDueDate: "" });

  return (
    <form
      className="space-y-2 mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(`/api/loans/${loanId}/approve`, {
          method: "POST",
          body: JSON.stringify({
            approvedAmount: Number(form.approvedAmount),
            monthlyInstalment: Number(form.monthlyInstalment),
            numberOfInstalments: Number(form.numberOfInstalments),
            firstPaymentDueDate: form.firstPaymentDueDate,
          }),
        });
      }}
    >
      <input required type="number" placeholder="Approved Amount" className={inputClass} value={form.approvedAmount} onChange={(e) => setForm({ ...form, approvedAmount: e.target.value })} />
      <input required type="number" placeholder="Monthly Instalment" className={inputClass} value={form.monthlyInstalment} onChange={(e) => setForm({ ...form, monthlyInstalment: e.target.value })} />
      <input required type="number" placeholder="Number of Instalments" className={inputClass} value={form.numberOfInstalments} onChange={(e) => setForm({ ...form, numberOfInstalments: e.target.value })} />
      <input required type="date" placeholder="First Due Date" className={inputClass} value={form.firstPaymentDueDate} onChange={(e) => setForm({ ...form, firstPaymentDueDate: e.target.value })} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button disabled={loading} className="rounded-md bg-emerald-700 text-white px-3 py-1.5 text-sm hover:bg-emerald-800 disabled:opacity-60">
        {loading ? "..." : "அங்கீகரிக்கவும் / Approve"}
      </button>
    </form>
  );
}

export function OverviewTab({ loan, currentUser, onChanged }: { loan: LoanDetail; currentUser: CurrentUser; onChanged: () => void }) {
  const rejectAction = useApiAction(onChanged);
  const disburseAction = useApiAction(onChanged);
  const statusAction = useApiAction(onChanged);
  const [disburseForm, setDisburseForm] = useState({ disbursementDate: "", disbursedAmount: "", paymentMethod: "CASH", voucherNumber: "", bankCashRef: "", notes: "" });

  const canApprove = ROLES_ALLOWED_TO_APPROVE_LOAN.includes(currentUser.role) && loan.loanStatus === "PENDING";
  const canDisburse =
    (currentUser.role === "FINANCE" || currentUser.role === "ADMIN") &&
    loan.loanStatus === "APPROVED" &&
    loan.signedAgreementStatus === "VERIFIED";
  const canChangeStatus = ROLES_ALLOWED_TO_DEFAULT.includes(currentUser.role) && !["COMPLETED", "REJECTED", "CANCELLED"].includes(loan.loanStatus);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-medium text-slate-800 mb-2">Borrower Details</h3>
        <Row ta="பெயர்" en="Applicant Name" value={loan.applicantName} />
        <Row ta="விண்ணப்பதாரர் குறியீடு" en="Applicant ID" value={loan.borrower.applicantCode} />
        <Row ta="தேசிய அடையாள அட்டை" en="NIC" value={loan.nic} />
        <Row ta="முகவரி" en="Address" value={loan.address} />
        <Row ta="தொடர்பு எண்" en="Contact Number" value={loan.contactNumber} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-medium text-slate-800 mb-2">Loan Details</h3>
        <Row ta="கடன் ஐடி" en="Loan ID" value={loan.id} />
        <Row ta="கடன் குறிப்பு எண்" en="Loan Reference Number" value={loan.loanReferenceNumber ?? "Not yet assigned"} />
        <Row ta="கோரப்பட்ட தொகை" en="Requested Amount" value={loan.requestedAmount} />
        <Row ta="அங்கீகரிக்கப்பட்ட தொகை" en="Approved Amount" value={loan.approvedAmount ?? "-"} />
        <Row ta="கடன் நோக்கம்" en="Loan Purpose" value={loan.loanPurpose} />
        <Row ta="அங்கீகார தேதி" en="Approval Date" value={formatDate(loan.approvalDate)} />
        <Row ta="வழங்கிய தேதி" en="Disbursement Date" value={formatDate(loan.disbursementDate)} />
        <Row ta="உருவாக்கியவர்" en="Created By" value={loan.createdBy.name} />
        <Row ta="அங்கீகரித்தவர்" en="Approved By" value={loan.approvedBy?.name ?? "-"} />
        <Row ta="உருவாக்கப்பட்டது" en="Created At" value={formatDateTime(loan.createdAt)} />
        <Row ta="புதுப்பிக்கப்பட்டது" en="Updated At" value={formatDateTime(loan.updatedAt)} />
      </div>

      {canApprove && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-medium text-slate-800 mb-1">அங்கீகரிக்கவும் / Approve Loan</h3>
          <ApproveForm loanId={loan.id} onChanged={onChanged} />
          <button
            disabled={rejectAction.loading}
            onClick={() => rejectAction.run(`/api/loans/${loan.id}/reject`, { method: "POST", body: JSON.stringify({}) })}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            நிராகரிக்கவும் / Reject Application
          </button>
          {rejectAction.error && <p className="text-xs text-red-600 mt-1">{rejectAction.error}</p>}
        </div>
      )}

      {canDisburse && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-medium text-slate-800 mb-2">கடன் வழங்குதல் / Disbursement</h3>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              disburseAction.run(`/api/loans/${loan.id}/disburse`, {
                method: "POST",
                body: JSON.stringify({ ...disburseForm, disbursedAmount: Number(disburseForm.disbursedAmount) }),
              });
            }}
          >
            <input required type="date" className={inputClass} value={disburseForm.disbursementDate} onChange={(e) => setDisburseForm({ ...disburseForm, disbursementDate: e.target.value })} />
            <input required type="number" placeholder="Disbursed Amount" className={inputClass} value={disburseForm.disbursedAmount} onChange={(e) => setDisburseForm({ ...disburseForm, disbursedAmount: e.target.value })} />
            <select className={inputClass} value={disburseForm.paymentMethod} onChange={(e) => setDisburseForm({ ...disburseForm, paymentMethod: e.target.value })}>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
            </select>
            <input placeholder="Bank / Cash Reference" className={inputClass} value={disburseForm.bankCashRef} onChange={(e) => setDisburseForm({ ...disburseForm, bankCashRef: e.target.value })} />
            <input required placeholder="Voucher Number" className={inputClass} value={disburseForm.voucherNumber} onChange={(e) => setDisburseForm({ ...disburseForm, voucherNumber: e.target.value })} />
            <textarea placeholder="Notes" className={inputClass} value={disburseForm.notes} onChange={(e) => setDisburseForm({ ...disburseForm, notes: e.target.value })} />
            {disburseAction.error && <p className="text-xs text-red-600">{disburseAction.error}</p>}
            <button disabled={disburseAction.loading} className="rounded-md bg-emerald-700 text-white px-3 py-1.5 text-sm hover:bg-emerald-800 disabled:opacity-60">
              {disburseAction.loading ? "..." : "வழங்கவும் / Disburse & Activate"}
            </button>
          </form>
        </div>
      )}

      {canChangeStatus && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-medium text-slate-800 mb-2">அதிகாரப்பூர்வ நிலை மாற்றம் / Authorized Status Change</h3>
          <p className="text-xs text-slate-500 mb-2">Restricted to Admin/Board — used only for serious, deliberate status changes.</p>
          <div className="flex gap-2">
            <button
              disabled={statusAction.loading}
              onClick={() => {
                const reason = window.prompt("Reason for marking this loan DEFAULTED?");
                if (reason) statusAction.run(`/api/loans/${loan.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "DEFAULTED", reason }) });
              }}
              className="rounded-md border border-red-300 text-red-700 px-3 py-1.5 text-sm hover:bg-red-50"
            >
              DEFAULTED
            </button>
            <button
              disabled={statusAction.loading}
              onClick={() => {
                const reason = window.prompt("Reason for cancelling this loan?");
                if (reason) statusAction.run(`/api/loans/${loan.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED", reason }) });
              }}
              className="rounded-md border border-slate-300 text-slate-600 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              CANCELLED
            </button>
          </div>
          {statusAction.error && <p className="text-xs text-red-600 mt-1">{statusAction.error}</p>}
        </div>
      )}
    </div>
  );
}
