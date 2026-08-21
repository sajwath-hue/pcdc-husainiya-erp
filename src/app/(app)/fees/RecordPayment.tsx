"use client";

import { useState } from "react";
import { recordPaymentAction } from "./actions";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function RecordPayment({ feeId, balance }: { feeId: string; balance: number }) {
  const [open, setOpen] = useState(false);
  const t = useDictionary();

  if (balance <= 0) return <span className="text-xs text-slate-300">—</span>;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">
        {t.fees.recordPayment}
      </button>
    );
  }

  return (
    <form action={recordPaymentAction} onSubmit={() => setOpen(false)} className="flex items-center gap-1">
      <input type="hidden" name="id" value={feeId} />
      <input
        type="number"
        name="additional"
        min={1}
        max={balance}
        step="1"
        autoFocus
        placeholder={`≤ ${balance}`}
        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs"
      />
      <button type="submit" className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700">
        {t.common.save}
      </button>
    </form>
  );
}
