import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { getProductGallery } from "@/lib/products";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery sản phẩm - AI Quest Engine",
  description: "Thư viện sản phẩm học tập do học sinh tạo trong AI Quest"
};

export default async function GalleryPage({
  searchParams
}: {
  searchParams: Promise<{ season_id?: string }>;
}) {
  const params = await searchParams;
  const data = await getProductGallery(params.season_id);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-xl border border-line bg-white px-5 py-5 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-circuit">
            AI Math Maker Gallery
          </p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink">
                {data.season?.name ?? "Thư viện sản phẩm học tập"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Nơi lưu lại sản phẩm, prompt và cách kiểm chứng AI của các lớp sau cuộc thi.
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="focus-ring inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
            >
              Bảng xếp hạng
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.products.map((product) => (
            <article key={product.id} className="rounded-xl border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">
                    Cửa {product.door} · {product.team_name ?? product.team_id}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-ink">{product.title}</h2>
                </div>
                {product.is_featured ? (
                  <Sparkles size={18} className="shrink-0 text-warning" aria-hidden="true" />
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {product.description}
              </p>
              {product.prompt ? (
                <div className="mt-4 rounded-lg bg-panel p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Prompt hay
                  </p>
                  <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {product.prompt}
                  </p>
                </div>
              ) : null}
              {product.verification ? (
                <div className="mt-3 rounded-lg bg-panel p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Kiểm chứng AI
                  </p>
                  <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {product.verification}
                  </p>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <p className="text-xs text-slate-500">{formatDateTime(product.created_at)}</p>
                {product.product_url ? (
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex items-center gap-1 rounded-lg bg-circuit px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                  >
                    Mở sản phẩm
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
          {data.products.length === 0 ? (
            <div className="col-span-full rounded-xl border border-line bg-white p-10 text-center text-slate-600 shadow-soft">
              Chưa có sản phẩm nào được nộp.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
