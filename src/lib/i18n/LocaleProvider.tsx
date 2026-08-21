"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Dictionary } from "./index";
import { LOCALE_COOKIE, type Locale } from "./locales";

const LocaleContext = createContext<{
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
} | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocaleState(next);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <LocaleContext.Provider
      value={{ locale, dictionary: getDictionary(locale), setLocale, isPending }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

/** Convenience hook for components that only need translated strings. */
export function useDictionary(): Dictionary {
  return useLocale().dictionary;
}
