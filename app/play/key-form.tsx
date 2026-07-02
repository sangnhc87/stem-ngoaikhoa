"use client";

import { useActionState } from "react";
import { KeyRound, Send } from "lucide-react";
import { submitKeyAction, type SubmitKeyState } from "@/app/play/actions";

const initialState: SubmitKeyState = {};

export function KeyForm({ disabled }: { disabled: boolean }) {
  const [state, formAction, pending] = useActionState(submitKeyAction, initialState);
  const isSuccess = state.result === "correct";

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink" htmlFor="key">
          <KeyRound size={17} aria-hidden="true" />
          Khóa mở cửa
        </label>
        <input
          id="key"
          name="key"
          className="focus-ring w-full rounded-lg border border-line bg-white px-4 py-3 text-base shadow-sm"
          placeholder="Nhập khóa của cửa hiện tại"
          autoComplete="off"
          disabled={disabled || pending}
          required
        />
      </div>
      {state.message ? (
        <p
          className={
            isSuccess
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
              : "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
          }
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={disabled || pending}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-signal px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={18} aria-hidden="true" />
        {pending ? "Đang nộp..." : "Nộp khóa"}
      </button>
    </form>
  );
}
