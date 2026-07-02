import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LogOut, Monitor, RadioTower } from "lucide-react";
import { logoutTeamAction } from "@/app/login/actions";
import { KeyForm } from "@/app/play/key-form";
import { getTeamContext } from "@/lib/game";
import { getTeamSession } from "@/lib/security/session";
import { statusLabel } from "@/lib/format";
import { getActiveAnnouncements } from "@/lib/announcements";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { CountdownTimer } from "@/components/countdown-timer";
import { ProductForm } from "@/app/play/product-form";

export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const context = await getTeamContext(session.teamUuid, session.seasonId, session.sessionToken);

  if (!context) {
    redirect("/login");
  }

  const { season, team, challenge, totalDoors } = context;
  const isOpen = season.status === "OPEN";
  const completed = totalDoors > 0 && team.current_door > totalDoors;
  const canSubmit = isOpen && Boolean(challenge) && !completed;
  const isProductDoor = Boolean(
    challenge &&
      /sản phẩm|san pham|product|maker|gallery/i.test(
        `${challenge.module ?? ""} ${challenge.title} ${challenge.mission}`
      )
  );

  const announcements = await getActiveAnnouncements(season.id);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-xl border border-line bg-white px-5 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-circuit">
              AI Quest Engine
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink md:text-3xl">{season.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Đội {team.team_name} · {statusLabel(season.status)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {season.end_time && isOpen && (
              <CountdownTimer endTime={season.end_time} />
            )}
            <Link
              href="/leaderboard"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
            >
              <RadioTower size={17} aria-hidden="true" />
              Bảng xếp hạng
            </Link>
            <form action={logoutTeamAction}>
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
                <LogOut size={17} aria-hidden="true" />
                Thoát
              </button>
            </form>
          </div>
        </header>

        <div className="mt-4">
          <AnnouncementBanner seasonId={season.id} initialAnnouncements={announcements} />
        </div>

        <section className="mt-6 grid gap-5 md:grid-cols-[0.68fr_0.32fr]">
          <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Tiến độ: Cửa {Math.min(team.current_door, Math.max(totalDoors, 1))} /{" "}
                  {totalDoors}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-ink">
                  {completed ? "Hoàn thành mùa thi" : challenge?.title ?? "Chưa có thử thách"}
                </h2>
              </div>
              <span className="rounded-lg bg-circuit/10 px-4 py-2 text-sm font-bold text-circuit">
                Đã mở {team.solved} cửa
              </span>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-circuit transition-all duration-500"
                style={{
                  width: `${totalDoors ? Math.min(100, (team.solved / totalDoors) * 100) : 0}%`
                }}
              />
            </div>

            <div className="mt-8 rounded-lg border border-line bg-panel p-5">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                Nhiệm vụ
              </p>
              <div className="mt-3 whitespace-pre-wrap text-base leading-8 text-ink">
                {completed
                  ? "Đội đã vượt qua tất cả các cửa. Hãy chờ kết quả cuối cùng từ ban tổ chức."
                  : challenge?.mission ?? "Giáo viên chưa cấu hình nhiệm vụ cho cửa này."}
              </div>
              {challenge?.file_url ? (
                <a
                  href={challenge.file_url}
                  className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={17} aria-hidden="true" />
                  Tải tệp thử thách
                </a>
              ) : null}
            </div>

            {isProductDoor ? (
              <div className="mt-5 rounded-lg border border-circuit/20 bg-circuit/5 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-circuit">
                  Nộp sản phẩm học tập
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Lưu lại sản phẩm, prompt và cách kiểm chứng của đội để trưng bày trong Gallery.
                </p>
                <ProductForm />
              </div>
            ) : null}
          </div>

          <aside className="rounded-xl border border-line bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-ink">Nộp khóa</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Hệ thống chỉ nhận khóa cho cửa hiện tại và ghi lại mọi lượt nộp.
            </p>
            {!isOpen ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                Cuộc thi chưa ở trạng thái mở.
              </p>
            ) : null}
            <div className="mt-5">
              <KeyForm disabled={!canSubmit} />
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-panel p-3">
                <dt className="text-slate-500">Sai</dt>
                <dd className="mt-1 text-2xl font-bold text-warning">{team.wrong_count}</dd>
              </div>
              <div className="rounded-lg bg-panel p-3">
                <dt className="text-slate-500">Cửa hiện tại</dt>
                <dd className="mt-1 text-2xl font-bold text-signal">{team.current_door}</dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2 border-t border-line pt-4">
              <Link
                href="/leaderboard"
                className="focus-ring flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-panel"
              >
                <RadioTower size={15} aria-hidden="true" />
                Xem bảng xếp hạng
              </Link>
              <a
                href="/display"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-panel"
              >
                <Monitor size={15} aria-hidden="true" />
                Màn hình chiếu
              </a>
              <a
                href="/gallery"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-panel"
              >
                <Monitor size={15} aria-hidden="true" />
                Gallery sản phẩm
              </a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
