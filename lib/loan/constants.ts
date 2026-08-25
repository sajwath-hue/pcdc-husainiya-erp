// Source of truth for every status/enum-like value used across the Loan
// Management module. SQLite cannot enforce Prisma enums, so these arrays +
// the zod schemas in validation.ts are what keep the data honest.

export const LOAN_STATUS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "DISBURSED",
  "ACTIVE",
  "COMPLETED",
  "DEFAULTED",
  "CANCELLED",
] as const;
export type LoanStatus = (typeof LOAN_STATUS)[number];

export const AGREEMENT_STATUS = ["NOT_GENERATED", "GENERATED"] as const;
export type AgreementStatus = (typeof AGREEMENT_STATUS)[number];

export const SIGNED_AGREEMENT_STATUS = [
  "NOT_GENERATED",
  "GENERATED",
  "AWAITING_SIGNATURE",
  "SIGNED",
  "UPLOADED",
  "VERIFIED",
] as const;
export type SignedAgreementStatus = (typeof SIGNED_AGREEMENT_STATUS)[number];

export const VERIFICATION_STATUS = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const INSTALMENT_STATUS = [
  "UPCOMING",
  "DUE",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "WAIVED",
  "CANCELLED",
] as const;
export type InstalmentStatus = (typeof INSTALMENT_STATUS)[number];

export const NOTICE_TYPE = [
  "PAYMENT_REMINDER",
  "SECOND_REMINDER",
  "FINAL_NOTICE",
] as const;
export type NoticeType = (typeof NOTICE_TYPE)[number];

export const DELIVERY_STATUS = ["NOT_DELIVERED", "DELIVERED", "ACKNOWLEDGED"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUS)[number];

export const DELIVERY_METHOD = [
  "PRINTED",
  "HAND_DELIVERED",
  "POST",
  "EMAIL",
  "OTHER",
] as const;
export type DeliveryMethod = (typeof DELIVERY_METHOD)[number];

export const ROLES = ["LOAN_OFFICER", "FINANCE", "ADMIN", "BOARD", "AUDITOR"] as const;
export type Role = (typeof ROLES)[number];

// Manual/serious status changes (e.g. -> DEFAULTED, WAIVED instalments)
// are restricted to these roles (spec section 8 & 17).
export const ROLES_ALLOWED_TO_DEFAULT: Role[] = ["ADMIN", "BOARD"];
export const ROLES_ALLOWED_TO_APPROVE_LOAN: Role[] = ["BOARD", "ADMIN"];
export const ROLES_ALLOWED_TO_VERIFY_DOCUMENTS: Role[] = ["ADMIN"];
export const ROLES_ALLOWED_TO_ISSUE_FINAL_NOTICE: Role[] = ["ADMIN", "BOARD"];

export const AUDIT_ACTIONS = [
  "LOAN_CREATED",
  "LOAN_APPROVED",
  "LOAN_REJECTED",
  "AGREEMENT_GENERATED",
  "AGREEMENT_UPLOADED",
  "AGREEMENT_VERIFIED",
  "AGREEMENT_REPLACED",
  "LOAN_DISBURSED",
  "REPAYMENT_SCHEDULE_GENERATED",
  "PAYMENT_RECORDED",
  "INSTALMENT_MARKED_OVERDUE",
  "NOTICE_GENERATED",
  "NOTICE_DELIVERED",
  "NOTICE_ACKNOWLEDGED",
  "LOAN_COMPLETED",
  "LOAN_STATUS_CHANGED",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const ACCEPTED_AGREEMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
