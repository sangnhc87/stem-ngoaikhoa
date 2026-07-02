"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitProductAction, type SubmitProductState } from "@/app/play/actions";

const initialState: SubmitProductState = {};

export function ProductForm() {
  const [state, formAction, pending] = useActionState(submitProductAction, initialState);

  return (
    <form action={formAction} className="mt-5 grid gap-3">
      <input
        className="focus-ring w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm"
        name="title"
        placeholder="Tên sản phẩm"
        required
      />
      <input
        className="focus-ring w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm"
        name="product_url"
        placeholder="Link sản phẩm / Google Drive / Canva / Padlet (nếu có)"
        type="url"
      />
      <textarea
        className="focus-ring min-h-24 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm"
        name="description"
        placeholder="Sản phẩm giúp ai, dùng để làm gì, cách sử dụng ra sao?"
        required
      />
      <textarea
        className="focus-ring min-h-20 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm"
        name="prompt"
        placeholder="Prompt hay nhất đội đã dùng (không bắt buộc)"
      />
      <textarea
        className="focus-ring min-h-20 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm"
        name="verification"
        placeholder="Đội đã kiểm chứng/chỉnh sửa AI như thế nào? (không bắt buộc)"
      />
      {state.message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        disabled={pending}
      >
        <Send size={16} aria-hidden="true" />
        {pending ? "Đang lưu..." : "Nộp sản phẩm"}
      </button>
    </form>
  );
}
