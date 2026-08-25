import { describe, it, expect } from "vitest";
import { generateRepaymentSchedule } from "@/lib/loan/repaymentSchedule";

describe("generateRepaymentSchedule", () => {
  it("generates the requested number of instalments with correct due dates", () => {
    const rows = generateRepaymentSchedule({
      approvedAmount: 100000,
      monthlyInstalment: 10000,
      numberOfInstalments: 10,
      firstPaymentDueDate: new Date(2026, 0, 15),
    });

    expect(rows).toHaveLength(10);
    expect(rows[0].instalmentNumber).toBe(1);
    expect(rows[0].dueDate).toEqual(new Date(2026, 0, 15));
    expect(rows[1].dueDate).toEqual(new Date(2026, 1, 15));
    expect(rows[9].dueDate).toEqual(new Date(2026, 9, 15));
    for (const row of rows) {
      expect(row.status).toBe("UPCOMING");
      expect(row.paidAmount).toBe(0);
    }
  });

  it("sums exactly to the approved amount, absorbing rounding in the final instalment", () => {
    const rows = generateRepaymentSchedule({
      approvedAmount: 100000,
      monthlyInstalment: 3333.33,
      numberOfInstalments: 3,
      firstPaymentDueDate: new Date(2026, 0, 1),
    });
    const total = rows.reduce((sum, r) => sum + r.amount, 0);
    expect(Math.round(total * 100) / 100).toBe(100000);
    expect(rows[0].amount).toBe(3333.33);
    expect(rows[1].amount).toBe(3333.33);
  });

  it("clamps end-of-month due dates instead of overflowing into the next month", () => {
    const rows = generateRepaymentSchedule({
      approvedAmount: 60000,
      monthlyInstalment: 20000,
      numberOfInstalments: 3,
      firstPaymentDueDate: new Date(2026, 0, 31), // 31 Jan
    });
    // February 2026 has 28 days -> should clamp to 28 Feb, not roll into March.
    expect(rows[1].dueDate).toEqual(new Date(2026, 1, 28));
  });

  it("rejects a non-positive monthly instalment", () => {
    expect(() =>
      generateRepaymentSchedule({
        approvedAmount: 1000,
        monthlyInstalment: 0,
        numberOfInstalments: 5,
        firstPaymentDueDate: new Date(),
      })
    ).toThrow();
  });
});
