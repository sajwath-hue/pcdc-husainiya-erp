"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { TL } from "@/components/BilingualLabel";
import { formatCurrency, formatDate } from "@/lib/format";
import type { LoanDetail, CurrentUser } from "./types";
import { OverviewTab } from "./tabs/OverviewTab";
import { AgreementTab } from "./tabs/AgreementTab";
import { RepaymentTab } from "./tabs/RepaymentTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { NoticesTab } from "./tabs/NoticesTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { AuditTab } from "./tabs/AuditTab";

const TABS = [
  { key: "overview", ta: "மேலோட்டம்", en: "Overview" },
  { key: "agreement", ta: "ஒப்பந்தம்", en: "Agreement" },
  { key: "repayment", ta: "திருப்பிச் செலுத்துதல்", en: "Repayment" },
  { key: "payments", ta: "கொடுப்பனவுகள்", en: "Payments" },
  { key: "notices", ta: "அறிவிப்புகள்", en: "Notices" },
  { key: "documents", ta: "ஆவணங்கள்", en: "Documents" },
  { key: "audit", ta: "தணிக்கை", en: "Audit" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function LoanProfile({ loan, currentUser }: { loan: LoanDetail; currentUser: CurrentUser }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-semibold text-slate-900">{loan.loanReferenceNumber ?? "Loan Application"}</h1>
          <StatusBadge status={loan.loanStatus} />
          <StatusBadge status={loan.signedAgreementStatus} />
          {loan.reminderRequired && (
            <span className="inline-flex items-center rounded-full bg-red-600 text-white px-2.5 py-0.5 text-xs font-medium animate-pulse">
              <TL ta="நினைவூட்டல் தேவை" en="Reminder Required" />
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {loan.applicantName} · {loan.borrower.applicantCode} · NIC {loan.nic}
        </p>
        <div className="mt-3 flex gap-6 text-sm">
          <div>
            <span className="text-slate-400">Outstanding Principal: </span>
            <span className="font-medium">{formatCurrency(loan.outstandingPrincipal)}</span>
          </div>
          <div>
            <span className="text-slate-400">Outstanding Amount: </span>
            <span className="font-medium">{formatCurrency(loan.outstandingAmount)}</span>
          </div>
          <div>
            <span className="text-slate-400">Requested: </span>
            <span className="font-medium">{formatCurrency(loan.requestedAmount)}</span>
          </div>
          {loan.approvedAmount != null && (
            <div>
              <span className="text-slate-400">Approved: </span>
              <span className="font-medium">{formatCurrency(loan.approvedAmount)}</span>
            </div>
          )}
          {loan.firstPaymentDueDate && (
            <div>
              <span className="text-slate-400">First Due: </span>
              <span className="font-medium">{formatDate(loan.firstPaymentDueDate)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 mb-4 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${
              tab === t.key ? "border-emerald-700 text-emerald-800 font-medium" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.ta} <span className="text-xs text-slate-400">/ {t.en}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab loan={loan} currentUser={currentUser} onChanged={refresh} />}
      {tab === "agreement" && <AgreementTab loan={loan} currentUser={currentUser} onChanged={refresh} />}
      {tab === "repayment" && <RepaymentTab loan={loan} currentUser={currentUser} onChanged={refresh} />}
      {tab === "payments" && <PaymentsTab loan={loan} />}
      {tab === "notices" && <NoticesTab loan={loan} currentUser={currentUser} onChanged={refresh} />}
      {tab === "documents" && <DocumentsTab loan={loan} currentUser={currentUser} onChanged={refresh} />}
      {tab === "audit" && <AuditTab loan={loan} />}
    </div>
  );
}
