"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/locales";

export function LanguageSwitcher() {
  const { locale, setLocale, isPending } = useLocale();

  return (
    <div className="relative flex items-center">
      <Languages
        size={16}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
        aria-label="Language"
        className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-7 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:border-blue-500 focus:outline-none disabled:opacity-60"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
