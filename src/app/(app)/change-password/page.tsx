import { PageHeader, Breadcrumb } from "@/components/ui/PageHeader";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Change Password" }]} />
      <PageHeader title="Change Password" description="Update the password for your staff account." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
