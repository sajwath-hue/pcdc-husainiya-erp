import { z } from "zod";
import {
  DELIVERY_METHOD,
  DELIVERY_STATUS,
  NOTICE_TYPE,
} from "./constants";

export const createLoanApplicationSchema = z.object({
  applicantName: z.string().min(1),
  nic: z.string().min(1),
  address: z.string().min(1),
  contactNumber: z.string().min(1),
  requestedAmount: z.number().positive(),
  loanPurpose: z.string().min(1),
  // Optional: link to an existing borrower profile instead of creating a new one.
  borrowerId: z.string().optional(),
});
export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;

export const approveLoanSchema = z.object({
  approvedAmount: z.number().positive(),
  monthlyInstalment: z.number().positive(),
  numberOfInstalments: z.number().int().positive(),
  firstPaymentDueDate: z.coerce.date(),
  approvalDate: z.coerce.date().optional(),
});
export type ApproveLoanInput = z.infer<typeof approveLoanSchema>;

export const rejectLoanSchema = z.object({
  reason: z.string().min(1).optional(),
});

export const disburseLoanSchema = z.object({
  disbursementDate: z.coerce.date(),
  disbursedAmount: z.number().positive(),
  paymentMethod: z.string().min(1),
  bankCashRef: z.string().optional(),
  voucherNumber: z.string().min(1),
  notes: z.string().optional(),
});
export type DisburseLoanInput = z.infer<typeof disburseLoanSchema>;

export const recordPaymentSchema = z.object({
  instalmentId: z.string().min(1),
  amountPaid: z.number().positive(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().min(1),
  receiptNumber: z.string().min(1),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const generateNoticeSchema = z.object({
  instalmentId: z.string().min(1),
  noticeType: z.enum(NOTICE_TYPE).default("PAYMENT_REMINDER"),
  reason: z.string().optional(),
});
export type GenerateNoticeInput = z.infer<typeof generateNoticeSchema>;

export const recordDeliverySchema = z.object({
  deliveryStatus: z.enum(DELIVERY_STATUS),
  deliveryMethod: z.enum(DELIVERY_METHOD).optional(),
  deliveredDate: z.coerce.date().optional(),
  borrowerAcknowledgement: z.string().optional(),
  notes: z.string().optional(),
});
export type RecordDeliveryInput = z.infer<typeof recordDeliverySchema>;

export const verifyAgreementSchema = z.object({
  verified: z.boolean(),
  notes: z.string().optional(),
});

export const changeLoanStatusSchema = z.object({
  status: z.enum(["DEFAULTED", "CANCELLED", "COMPLETED"]),
  reason: z.string().min(1),
});
