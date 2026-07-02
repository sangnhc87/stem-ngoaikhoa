"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { adminLoginAction, type AdminLoginState } from "@/app/admin/actions";

const initialState: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink" htmlFor="password">
          Mật khẩu quản trị
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-base shadow-sm"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 font-semibold text-white shadow-soft hover:bg-slate-800 disabled:opacity-60"
        disabled={pending}
      >
        <LockKeyhole size={18} aria-hidden="true" />
        {pending ? "Đang kiểm tra..." : "Vào trang quản trị"}
      </button>
    </form>
  );
}
