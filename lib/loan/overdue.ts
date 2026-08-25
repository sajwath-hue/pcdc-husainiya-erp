import type { InstalmentStatus } from "./constants";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface OverdueResult {
  status: InstalmentStatus;
  daysOverdue: number;
  monthsOverdue: number;
  outstandingInstalmentAmount: number;
}

/**
 * Spec section 7 — a payment must never be considered overdue before its
 * due date, and the exact rules for UPCOMING / DUE / PARTIALLY_PAID / PAID
 * / OVERDUE are implemented literally from the task specification:
 *
 *   today < dueDate                                  -> UPCOMING
 *   today == dueDate, paid >= amount                  -> PAID
 *   today == dueDate, 0 < paid < amount                -> PARTIALLY_PAID
 *   today == dueDate, paid == 0                        -> DUE
 *   today > dueDate,  paid >= amount                   -> PAID
 *   today > dueDate,  paid < amount (0 or partial)      -> OVERDUE
 *
 * WAIVED and CANCELLED are manual overrides applied by staff and are never
 * produced by this calculation — callers should skip recompute for
 * instalments already in one of those states.
 */
export function computeInstalmentStatus(
  dueDate: Date,
  amount: number,
  paidAmount: number,
  today: Date = new Date()
): OverdueResult {
  const due = startOfDay(dueDate);
  const now = startOfDay(today);
  const outstandingInstalmentAmount = Math.max(0, Math.round((amount - paidAmount) * 100) / 100);

  if (now.getTime() < due.getTime()) {
    return { status: "UPCOMING", daysOverdue: 0, monthsOverdue: 0, outstandingInstalmentAmount };
  }

  const isFullyPaid = paidAmount >= amount;
  const daysPast = Math.round((now.getTime() - due.getTime()) / MS_PER_DAY);

  if (isFullyPaid) {
    return { status: "PAID", daysOverdue: 0, monthsOverdue: 0, outstandingInstalmentAmount: 0 };
  }

  if (now.getTime() === due.getTime()) {
    return {
      status: paidAmount > 0 ? "PARTIALLY_PAID" : "DUE",
      daysOverdue: 0,
      monthsOverdue: 0,
      outstandingInstalmentAmount,
    };
  }

  // now > due, and not fully paid: OVERDUE (whether nothing or only part was paid)
  return {
    status: "OVERDUE",
    daysOverdue: daysPast,
    monthsOverdue: Math.floor(daysPast / 30),
    outstandingInstalmentAmount,
  };
}

/** Days between a (known-overdue) due date and `now`, floored to a whole day. */
export function daysOverdueFrom(dueDate: Date, now: Date = new Date()): number {
  return Math.floor((startOfDay(now).getTime() - startOfDay(dueDate).getTime()) / MS_PER_DAY);
}

/** Default threshold (spec section 8): a full missed monthly repayment period. */
export const DEFAULT_REMINDER_THRESHOLD_DAYS = 30;

export function getReminderThresholdDays(): number {
  const raw = process.env.REMINDER_THRESHOLD_DAYS;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_REMINDER_THRESHOLD_DAYS;
}

/**
 * Notice Required = YES once an overdue instalment has passed the
 * configured one-month threshold. This never escalates the loan status
 * itself — only authorized staff/board can move a loan to DEFAULTED
 * (spec section 8 & 17).
 */
export function isReminderRequired(daysOverdue: number, thresholdDays: number = getReminderThresholdDays()): boolean {
  return daysOverdue >= thresholdDays;
}

/**
 * Loan-level convenience wrapper: true if any OVERDUE instalment has
 * passed the reminder threshold. Takes `now` explicitly (defaulted) so
 * call sites never need to reach for `Date.now()`/`new Date()` themselves.
 */
export function isLoanReminderRequired(
  instalments: { status: string; dueDate: Date | string }[],
  now: Date = new Date(),
  thresholdDays: number = getReminderThresholdDays()
): boolean {
  return instalments.some((i) => {
    if (i.status !== "OVERDUE") return false;
    const due = new Date(i.dueDate);
    const daysOverdue = Math.floor((now.getTime() - due.getTime()) / MS_PER_DAY);
    return isReminderRequired(daysOverdue, thresholdDays);
  });
}
