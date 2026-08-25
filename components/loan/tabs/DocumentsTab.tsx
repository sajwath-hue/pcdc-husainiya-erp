"use client";

import { useRef } from "react";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { useApiAction } from "../useApiAction";
import type { LoanDetail, CurrentUser } from "../types";

export function DocumentsTab({ loan, currentUser, onChanged }: { loan: LoanDetail; currentUser: CurrentUser; onChanged: () => void }) {
  const uploadAction = useApiAction(onChanged);
  const verifyAction = useApiAction(onChanged);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = ["LOAN_OFFICER", "FINANCE", "ADMIN"].includes(currentUser.role) && loan.agreementStatus === "GENERATED";
  const canVerify = currentUser.role === "ADMIN";
  const current = loan.signedAgreements.find((d) => d.isCurrent);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    uploadAction.run(`/api/loans/${loan.id}/signed-agreement`, { method: "POST", body: formData }).finally(() => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-medium text-slate-800 mb-2">கையொப்பமிட்ட ஒப்பந்தத்தை பதிவேற்றவும் / Upload Signed Agreement</h3>
          <p className="text-xs text-slate-500 mb-2">Accepted formats: PDF, JPG, JPEG, PNG (max 15MB).</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/jpg,image/png"
            onChange={onFileSelected}
            disabled={uploadAction.loading}
            className="text-sm"
          />
          {uploadAction.loading && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
          {uploadAction.error && <p className="text-xs text-red-600 mt-1">{uploadAction.error}</p>}
          {current && <p className="text-xs text-slate-400 mt-2">Selecting a new file will replace the current signed agreement (previous copy is kept for audit — never deleted).</p>}
        </div>
      )}
      {!canUpload && loan.agreementStatus !== "GENERATED" && (
        <p className="text-sm text-slate-400">Generate the Loan Agreement first, under the Agreement tab.</p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-medium text-slate-800 mb-3">பதிவு வரலாறு / Upload History</h3>
        {verifyAction.error && <p className="text-xs text-red-600 mb-2">{verifyAction.error}</p>}
        <table className="min-w-full text-sm">
          <thead className="text-xs text-slate-500 uppercase">
            <tr>
              <th className="text-left py-1.5">File</th>
              <th className="text-left py-1.5">Uploaded By</th>
              <th className="text-left py-1.5">Uploaded At</th>
              <th className="text-left py-1.5">Verification</th>
              <th className="text-left py-1.5">Verified By</th>
              <th className="text-left py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {loan.signedAgreements.map((doc) => (
              <tr key={doc.id} className={`border-t border-slate-100 ${!doc.isCurrent ? "text-slate-400" : ""}`}>
                <td className="py-2">
                  {doc.fileName} {!doc.isCurrent && <span className="text-xs">(superseded)</span>}
                </td>
                <td className="py-2">{doc.uploadedBy.name}</td>
                <td className="py-2">{formatDateTime(doc.uploadedAt)}</td>
                <td className="py-2">
                  <StatusBadge status={doc.verificationStatus} />
                </td>
                <td className="py-2">{doc.verifiedBy?.name ?? "-"}</td>
                <td className="py-2 space-x-3">
                  <a href={`/api/files/${doc.filePath}`} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                    View
                  </a>
                  <a href={`/api/files/${doc.filePath}?download=1`} className="text-emerald-700 hover:underline">
                    Download
                  </a>
                  {canVerify && doc.isCurrent && doc.verificationStatus === "PENDING" && (
                    <>
                      <button
                        disabled={verifyAction.loading}
                        onClick={() => verifyAction.run(`/api/loans/${loan.id}/signed-agreement/${doc.id}/verify`, { method: "POST", body: JSON.stringify({ verified: true }) })}
                        className="text-emerald-700 hover:underline"
                      >
                        Verify
                      </button>
                      <button
                        disabled={verifyAction.loading}
                        onClick={() => verifyAction.run(`/api/loans/${loan.id}/signed-agreement/${doc.id}/verify`, { method: "POST", body: JSON.stringify({ verified: false }) })}
                        className="text-red-600 hover:underline"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {loan.signedAgreements.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No signed agreement uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
