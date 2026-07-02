import Link from "next/link";
import { Trophy } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-line bg-white shadow-soft md:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-ink px-8 py-10 text-white md:px-10">
          <div className="mb-10 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold">
            <Trophy size={18} aria-hidden="true" />
            AI Quest Engine
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Phòng thi STEM cho đội lớp
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
            Đăng nhập bằng mã đội để mở cửa hiện tại, nộp khóa và theo dõi tiến độ
            trong mùa thi.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-slate-200">
            <Link className="font-semibold text-cyan-200 hover:text-white" href="/leaderboard">
              Xem bảng xếp hạng
            </Link>
            <Link className="font-semibold text-cyan-200 hover:text-white" href="/display">
              Màn hình trình chiếu
            </Link>
          </div>
        </div>
        <div className="px-6 py-8 md:px-10 md:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-circuit">
            Đội thi
          </p>
          <h2 className="mt-3 text-2xl font-bold text-ink">Đăng nhập đội thi</h2>
          <div className="mt-7">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
