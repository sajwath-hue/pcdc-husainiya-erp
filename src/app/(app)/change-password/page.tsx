import { PageHeader, Breadcrumb } from "@/components/ui/PageHeader";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function ChangePasswordPage() {
  const t = getDictionary(await getLocale());
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t.nav.dashboard, href: "/dashboard" }, { label: t.changePassword.title }]} />
      <PageHeader title={t.changePassword.title} description={t.changePassword.subtitle} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
