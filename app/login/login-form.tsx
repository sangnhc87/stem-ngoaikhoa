"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginTeamAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginTeamAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink" htmlFor="team_id">
          Mã đội
        </label>
        <input
          id="team_id"
          name="team_id"
          autoComplete="username"
          className="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-base shadow-sm"
          placeholder="T01"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink" htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-base shadow-sm"
          required
        />
      </div>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-circuit px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <LogIn size={18} aria-hidden="true" />
        {pending ? "Đang kiểm tra..." : "Vào phòng thi"}
      </button>
    </form>
  );
}
