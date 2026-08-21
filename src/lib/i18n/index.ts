import en from "./dictionaries/en";
import ta from "./dictionaries/ta";
import fa from "./dictionaries/fa";
import { DEFAULT_LOCALE, type Locale } from "./locales";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ta, fa };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/** Replaces `{placeholder}` tokens in a translated string, e.g. t.dashboard.welcome. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

export * from "./locales";
