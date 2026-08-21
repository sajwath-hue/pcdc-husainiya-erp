"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

const initialState: ChangePasswordState = { error: null, success: false };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  const t = useDictionary();

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t.changePassword.newPassword}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t.changePassword.confirmPassword}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          {t.changePassword.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? t.changePassword.updating : t.changePassword.submit}
      </button>
    </form>
  );
}
