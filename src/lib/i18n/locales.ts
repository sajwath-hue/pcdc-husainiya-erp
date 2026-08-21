export const LOCALES = ["en", "ta", "fa"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ta: "தமிழ்",
  fa: "فارسی",
};

export const RTL_LOCALES: readonly Locale[] = ["fa"];

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const LOCALE_COOKIE = "NEXT_LOCALE";
