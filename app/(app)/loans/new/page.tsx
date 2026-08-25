"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TLStack } from "@/components/BilingualLabel";

function Field({
  ta,
  en,
  children,
}: {
  ta: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1">
        <TLStack ta={ta} en={en} className="text-sm text-slate-700" />
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export default function NewLoanApplicationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    applicantName: "",
    nic: "",
    address: "",
    contactNumber: "",
    requestedAmount: "",
    loanPurpose: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, requestedAmount: Number(form.requestedAmount) }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create loan application.");
      return;
    }
    const loan = await res.json();
    router.push(`/loans/${loan.id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-slate-900 mb-1">
        புதிய கடன் விண்ணப்பம் <span className="text-slate-400 text-sm">/ New Loan Application</span>
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Existing PCDC Loan Application form — every field below feeds the immutable loan record.
      </p>

      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <Field ta="விண்ணப்பதாரர் பெயர்" en="Applicant Name">
          <input required value={form.applicantName} onChange={(e) => update("applicantName", e.target.value)} className={inputClass} />
        </Field>
        <Field ta="தேசிய அடையாள அட்டை எண்" en="NIC / Identification Number">
          <input required value={form.nic} onChange={(e) => update("nic", e.target.value)} className={inputClass} />
        </Field>
        <Field ta="முகவரி" en="Address">
          <textarea required value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} rows={2} />
        </Field>
        <Field ta="தொடர்பு எண்" en="Contact Number">
          <input required value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)} className={inputClass} />
        </Field>
        <Field ta="கோரப்பட்ட தொகை" en="Requested Amount (Rs.)">
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={form.requestedAmount}
            onChange={(e) => update("requestedAmount", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field ta="கடன் நோக்கம்" en="Loan Purpose">
          <textarea required value={form.loanPurpose} onChange={(e) => update("loanPurpose", e.target.value)} className={inputClass} rows={2} />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-emerald-700 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "..." : "விண்ணப்பத்தை சமர்ப்பிக்கவும் / Submit Application"}
        </button>
      </form>
    </div>
  );
}
