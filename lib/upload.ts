import { ACCEPTED_AGREEMENT_MIME_TYPES, MAX_UPLOAD_BYTES } from "@/lib/loan/constants";

export function validateAgreementUpload(file: File): string | null {
  if (!ACCEPTED_AGREEMENT_MIME_TYPES.includes(file.type as (typeof ACCEPTED_AGREEMENT_MIME_TYPES)[number])) {
    return "Only PDF, JPG, JPEG, or PNG files are accepted.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File exceeds the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}
