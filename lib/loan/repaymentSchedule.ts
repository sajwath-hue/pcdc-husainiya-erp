export interface ScheduleRow {
  instalmentNumber: number;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  balance: number;
  status: "UPCOMING";
}

function addMonthsClamped(date: Date, months: number): Date {
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const daysInTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, daysInTargetMonth));
  return result;
}

/**
 * Generates a repayment schedule for a loan that has just become ACTIVE.
 *
 * The final instalment absorbs any rounding remainder so the sum of all
 * instalment amounts always equals the approved loan amount exactly, even
 * when approvedAmount / numberOfInstalments doesn't divide evenly.
 */
export function generateRepaymentSchedule(params: {
  approvedAmount: number;
  monthlyInstalment: number;
  numberOfInstalments: number;
  firstPaymentDueDate: Date;
}): ScheduleRow[] {
  const { approvedAmount, monthlyInstalment, numberOfInstalments, firstPaymentDueDate } = params;

  if (numberOfInstalments < 1) {
    throw new Error("numberOfInstalments must be at least 1");
  }
  if (monthlyInstalment <= 0) {
    throw new Error("monthlyInstalment must be positive");
  }

  const rows: ScheduleRow[] = [];
  let allocated = 0;

  for (let i = 1; i <= numberOfInstalments; i++) {
    const isLast = i === numberOfInstalments;
    const amount = isLast
      ? Math.round((approvedAmount - allocated) * 100) / 100
      : Math.round(monthlyInstalment * 100) / 100;
    allocated += amount;

    rows.push({
      instalmentNumber: i,
      dueDate: addMonthsClamped(firstPaymentDueDate, i - 1),
      amount,
      paidAmount: 0,
      balance: amount,
      status: "UPCOMING",
    });
  }

  return rows;
}
