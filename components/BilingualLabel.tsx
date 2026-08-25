/** Tamil-first, English-secondary label used throughout the Loan Management UI (spec section 19). */
export function TL({ ta, en, className }: { ta: string; en: string; className?: string }) {
  return (
    <span className={className}>
      <span className="font-medium">{ta}</span>{" "}
      <span className="text-slate-400 font-normal">/ {en}</span>
    </span>
  );
}

/** Stacked variant for form field labels / detail rows. */
export function TLStack({ ta, en, className }: { ta: string; en: string; className?: string }) {
  return (
    <span className={className}>
      <span className="block font-medium">{ta}</span>
      <span className="block text-xs text-slate-400">{en}</span>
    </span>
  );
}
