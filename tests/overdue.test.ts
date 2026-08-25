import { describe, it, expect } from "vitest";
import { computeInstalmentStatus, isReminderRequired } from "@/lib/loan/overdue";

describe("computeInstalmentStatus", () => {
  const dueDate = new Date(2026, 8, 1); // 01 Sep 2026

  it("is UPCOMING before the due date, regardless of payment", () => {
    const today = new Date(2026, 7, 31);
    expect(computeInstalmentStatus(dueDate, 10000, 0, today).status).toBe("UPCOMING");
    expect(computeInstalmentStatus(dueDate, 10000, 5000, today).status).toBe("UPCOMING");
  });

  it("is DUE on the due date itself when nothing has been paid", () => {
    const result = computeInstalmentStatus(dueDate, 10000, 0, dueDate);
    expect(result.status).toBe("DUE");
    expect(result.daysOverdue).toBe(0);
  });

  it("is PARTIALLY_PAID on the due date when partially paid", () => {
    const result = computeInstalmentStatus(dueDate, 10000, 4000, dueDate);
    expect(result.status).toBe("PARTIALLY_PAID");
  });

  it("is PAID on the due date when paid in full", () => {
    expect(computeInstalmentStatus(dueDate, 10000, 10000, dueDate).status).toBe("PAID");
  });

  it("is PAID after the due date when paid in full", () => {
    const today = new Date(2026, 8, 15);
    expect(computeInstalmentStatus(dueDate, 10000, 10000, today).status).toBe("PAID");
  });

  it("is OVERDUE after the due date with zero payment, with correct days/months overdue", () => {
    const today = new Date(2026, 9, 5); // 05 Oct 2026 -> 34 days after due date
    const result = computeInstalmentStatus(dueDate, 10000, 0, today);
    expect(result.status).toBe("OVERDUE");
    expect(result.daysOverdue).toBe(34);
    expect(result.monthsOverdue).toBe(1);
    expect(result.outstandingInstalmentAmount).toBe(10000);
  });

  it("is OVERDUE after the due date even with a partial payment", () => {
    const today = new Date(2026, 8, 10); // 9 days after due date
    const result = computeInstalmentStatus(dueDate, 10000, 4000, today);
    expect(result.status).toBe("OVERDUE");
    expect(result.daysOverdue).toBe(9);
    expect(result.outstandingInstalmentAmount).toBe(6000);
  });

  it("never reports overdue for a date before the due date, even one day prior", () => {
    const today = new Date(2026, 7, 31);
    const result = computeInstalmentStatus(dueDate, 10000, 0, today);
    expect(result.status).not.toBe("OVERDUE");
    expect(result.daysOverdue).toBe(0);
  });
});

describe("isReminderRequired", () => {
  it("is false before the threshold", () => {
    expect(isReminderRequired(29, 30)).toBe(false);
  });

  it("is true once the threshold is reached (one full monthly period)", () => {
    expect(isReminderRequired(30, 30)).toBe(true);
    expect(isReminderRequired(45, 30)).toBe(true);
  });
});
