import type { Role } from "@/lib/loan/constants";

export interface UserRef {
  id: string;
  name: string;
  role?: string;
}

export interface BorrowerRef {
  id: string;
  applicantCode: string;
  name: string;
  nic: string;
  address: string;
  contactNumber: string;
}

export interface LoanAgreementRef {
  id: string;
  version: number;
  filePath: string;
  generatedAt: string;
  generatedById: string;
  isCurrent: boolean;
}

export interface SignedAgreementRef {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedById: string;
  uploadedAt: string;
  verificationStatus: string;
  verifiedById: string | null;
  verifiedAt: string | null;
  isCurrent: boolean;
  uploadedBy: UserRef;
  verifiedBy: UserRef | null;
}

export interface DisbursementRef {
  id: string;
  disbursementDate: string;
  approvedAmount: number;
  disbursedAmount: number;
  paymentMethod: string;
  bankCashRef: string | null;
  voucherNumber: string;
  authorizedById: string;
  notes: string | null;
  authorizedBy: UserRef;
}

export interface InstalmentRef {
  id: string;
  instalmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
}

export interface PaymentRef {
  id: string;
  instalmentId: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  receiptNumber: string;
  referenceNumber: string | null;
  receivedById: string;
  notes: string | null;
  receivedBy: UserRef;
}

export interface NoticeRef {
  id: string;
  noticeNumber: string;
  noticeType: string;
  noticeDate: string;
  reason: string;
  outstandingAmount: number;
  filePath: string;
  generatedById: string;
  deliveredDate: string | null;
  deliveryMethod: string | null;
  deliveryStatus: string;
  borrowerAcknowledgement: string | null;
  notes: string | null;
  generatedBy: UserRef;
}

export interface AuditLogRef {
  id: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: UserRef | null;
}

export interface LoanDetail {
  id: string;
  loanReferenceNumber: string | null;
  borrowerId: string;
  applicantName: string;
  nic: string;
  address: string;
  contactNumber: string;
  requestedAmount: number;
  approvedAmount: number | null;
  loanPurpose: string;
  approvalDate: string | null;
  disbursementDate: string | null;
  monthlyInstalment: number | null;
  numberOfInstalments: number | null;
  firstPaymentDueDate: string | null;
  loanStatus: string;
  outstandingPrincipal: number;
  outstandingAmount: number;
  agreementStatus: string;
  signedAgreementStatus: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  approvedById: string | null;
  borrower: BorrowerRef;
  createdBy: UserRef;
  approvedBy: UserRef | null;
  agreements: LoanAgreementRef[];
  signedAgreements: SignedAgreementRef[];
  disbursement: DisbursementRef | null;
  instalments: InstalmentRef[];
  payments: PaymentRef[];
  notices: NoticeRef[];
  auditLogs: AuditLogRef[];
  reminderRequired: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
