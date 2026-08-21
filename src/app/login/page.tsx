import { GraduationCap } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function LoginPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const t = getDictionary(await getLocale());

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0b1730] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-xl font-semibold text-white">{t.login.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{t.login.subtitle}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          {configured ? (
            <LoginForm />
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-700">
              {t.login.notConfigured}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">{t.login.contactOffice}</p>
      </div>
    </div>
  );
}
