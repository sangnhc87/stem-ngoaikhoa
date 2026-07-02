import Link from "next/link";
import {
  ArchiveRestore,
  Copy,
  DoorOpen,
  Download,
  LogOut,
  Megaphone,
  Monitor,
  Plus,
  RadioTower,
  ShieldCheck,
  Upload,
  X
} from "lucide-react";
import {
  adminLogoutAction,
  cloneSeasonChallengesAction,
  createAnnouncementAction,
  createChallengeAction,
  createSeasonAction,
  createTeamAction,
  deactivateAnnouncementAction,
  resetSeasonAction,
  unlockTeamSessionAction,
  updateSeasonStatusAction,
  uploadChallengeFileAction
} from "@/app/admin/actions";
import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { ImportPanel } from "@/app/admin/import-panel";
import { getAdminDashboardData } from "@/lib/admin-data";
import { formatDateTime, statusLabel } from "@/lib/format";
import { getAdminSession } from "@/lib/security/session";
import { getActiveAnnouncements } from "@/lib/announcements";

export const dynamic = "force-dynamic";

const noticeText: Record<string, string> = {
  "season-created": "Đã tạo mùa thi.",
  "season-invalid": "Thông tin mùa thi chưa hợp lệ.",
  "status-updated": "Đã cập nhật trạng thái mùa thi.",
  "status-invalid": "Trạng thái mùa thi chưa hợp lệ.",
  "team-created": "Đã tạo đội.",
  "team-invalid": "Thông tin đội chưa hợp lệ.",
  "team-duplicate": "Mã đội đã tồn tại trong mùa này.",
  "team-unlocked": "Đã mở khóa phiên đăng nhập của đội.",
  "challenge-created": "Đã tạo thử thách.",
  "challenge-invalid": "Thông tin thử thách chưa hợp lệ.",
  "challenge-duplicate": "Số cửa đã tồn tại trong mùa này.",
  "file-missing": "Chưa chọn tệp thử thách.",
  "file-invalid": "Thông tin tệp hoặc cửa chưa hợp lệ.",
  "file-too-large": "Tệp quá lớn. Giới hạn hiện tại là 25MB.",
  "challenge-missing": "Không tìm thấy thử thách tương ứng.",
  "file-uploaded": "Đã tải tệp thử thách.",
  "season-reset": "Đã đặt lại mùa thi về trạng thái nháp.",
  "announcement-sent": "Đã gửi thông báo đến tất cả đội.",
  "announcement-removed": "Đã xóa thông báo.",
  "announcement-invalid": "Thông báo không hợp lệ (quá ngắn hoặc thiếu mùa thi).",
  "clone-done": "Đã sao chép thử thách sang mùa mới.",
  "clone-empty": "Mùa nguồn chưa có thử thách nào.",
  "clone-conflict": "Tất cả cửa đã tồn tại trong mùa đích.",
  "clone-invalid": "Chọn hai mùa thi khác nhau."
};

const inputClass =
  "focus-ring w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm";

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "OPEN"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "CLOSED"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span className={`rounded-lg border px-3 py-1 text-sm font-bold ${className}`}>
      {statusLabel(status)}
    </span>
  );
}

function StatCard({ label, value, tone = "ink" }: { label: string; value: number; tone?: "ink" | "circuit" | "warning" }) {
  const valueClass =
    tone === "circuit" ? "text-circuit" : tone === "warning" ? "text-warning" : "text-ink";

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ season_id?: string; notice?: string }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-xl border border-line bg-white p-7 shadow-soft">
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-circuit">
              AI Quest Engine
            </p>
            <h1 className="mt-3 text-2xl font-bold text-ink">Quản trị cuộc thi</h1>
          </div>
          <AdminLoginForm />
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const data = await getAdminDashboardData(params.season_id);
  const { selectedSeason } = data;

  const announcements = selectedSeason
    ? await getActiveAnnouncements(selectedSeason.id)
    : [];

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-xl border border-line bg-white px-5 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-circuit">
              Bảng điều khiển
            </p>
            <h1 className="mt-2 text-3xl font-bold text-ink">AI Quest Engine</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/huong-dan-admin.html"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
            >
              Hướng dẫn
            </a>
            {selectedSeason && (
              <Link
                href={`/monitor?season_id=${selectedSeason.id}`}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
              >
                <Monitor size={17} aria-hidden="true" />
                Màn hình BGK
              </Link>
            )}
            <Link
              href="/leaderboard"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
            >
              <RadioTower size={17} aria-hidden="true" />
              Bảng xếp hạng
            </Link>
            <Link
              href="/gallery"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
            >
              <Monitor size={17} aria-hidden="true" />
              Gallery
            </Link>
            <form action={adminLogoutAction}>
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
                <LogOut size={17} aria-hidden="true" />
                Thoát
              </button>
            </form>
          </div>
        </header>

        {selectedSeason ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Tổng số đội" value={data.teams.length} />
            <StatCard label="Số cửa" value={data.challenges.length} />
            <StatCard
              label="Lượt nộp sai"
              value={data.teams.reduce((acc, t) => acc + t.wrong_count, 0)}
              tone="warning"
            />
            <StatCard
              label="Cửa đã giải"
              value={data.teams.reduce((acc, t) => acc + t.solved, 0)}
              tone="circuit"
            />
          </div>
        ) : null}

        {params.notice ? (
          <p className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
            {noticeText[params.notice] ?? "Đã xử lý yêu cầu."}
          </p>
        ) : null}

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.32fr_0.68fr]">
          <aside className="space-y-5">
            <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                <ShieldCheck size={20} aria-hidden="true" />
                Mùa thi
              </h2>
              <div className="mt-4 space-y-2">
                {data.seasons.map((season) => (
                  <Link
                    key={season.id}
                    href={`/admin?season_id=${season.id}`}
                    className={
                      season.id === selectedSeason?.id
                        ? "block rounded-lg border border-circuit bg-circuit/10 px-3 py-3"
                        : "block rounded-lg border border-line bg-white px-3 py-3 hover:bg-panel"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-ink">{season.name}</span>
                      <StatusBadge status={season.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {season.year ?? "Chưa đặt năm"} · {season.theme ?? "Chưa đặt chủ đề"}
                    </p>
                  </Link>
                ))}
                {data.seasons.length === 0 ? (
                  <p className="rounded-lg bg-panel px-3 py-3 text-sm text-slate-600">
                    Chưa có mùa thi.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                <Plus size={20} aria-hidden="true" />
                Tạo mùa thi
              </h2>
              <form action={createSeasonAction} className="mt-4 grid gap-3">
                <input className={inputClass} name="name" placeholder="Tên mùa thi" required />
                <input className={inputClass} name="year" placeholder="Năm" type="number" />
                <input className={inputClass} name="theme" placeholder="Chủ đề" />
                <button className="focus-ring rounded-lg bg-circuit px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                  Tạo mùa
                </button>
              </form>
            </section>

            {data.seasons.length >= 2 && selectedSeason && (
              <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                  <Copy size={17} aria-hidden="true" />
                  Sao chép thử thách
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Sao chép thử thách từ mùa cũ sang mùa hiện tại, không sao chép đáp án.
                </p>
                <form action={cloneSeasonChallengesAction} className="mt-3 grid gap-2">
                  <input type="hidden" name="target_season_id" value={selectedSeason.id} />
                  <select className={`${inputClass} text-sm`} name="source_season_id" required>
                    <option value="">-- Chọn mùa nguồn --</option>
                    {data.seasons
                      .filter((s) => s.id !== selectedSeason.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.year ?? "?"})
                        </option>
                      ))}
                  </select>
                  <button className="focus-ring rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    Sao chép thử thách
                  </button>
                </form>
              </section>
            )}
          </aside>

          <div className="space-y-5">
            {selectedSeason ? (
              <>
                <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-ink">{selectedSeason.name}</h2>
                        <StatusBadge status={selectedSeason.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {selectedSeason.theme ?? "Chưa đặt chủ đề"} · tạo lúc{" "}
                        {formatDateTime(selectedSeason.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["DRAFT", "OPEN", "CLOSED"] as const).map((status) => (
                        <form action={updateSeasonStatusAction} key={status}>
                          <input type="hidden" name="season_id" value={selectedSeason.id} />
                          <input type="hidden" name="status" value={status} />
                          <button className="focus-ring rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
                            {statusLabel(status)}
                          </button>
                        </form>
                      ))}
                      <form action={resetSeasonAction}>
                        <input type="hidden" name="season_id" value={selectedSeason.id} />
                        <button className="focus-ring inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                          <ArchiveRestore size={16} aria-hidden="true" />
                          Reset
                        </button>
                      </form>
                      <a
                        href={`/api/export?season_id=${selectedSeason.id}`}
                        className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
                        download
                      >
                        <Download size={16} aria-hidden="true" />
                        Xuất kết quả
                      </a>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                  <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                    <Megaphone size={18} aria-hidden="true" />
                    Thông báo đến đội thi
                  </h2>
                  <form action={createAnnouncementAction} className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                    <input type="hidden" name="season_id" value={selectedSeason.id} />
                    <input
                      className={inputClass}
                      name="message"
                      placeholder="Nội dung thông báo..."
                      required
                      minLength={3}
                    />
                    <select
                      className={inputClass}
                      name="expires_in"
                    >
                      <option value="">Không hết hạn</option>
                      <option value="15">15 phút</option>
                      <option value="30">30 phút</option>
                      <option value="60">1 giờ</option>
                    </select>
                    <button className="focus-ring rounded-lg bg-circuit px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                      Gửi
                    </button>
                  </form>

                  {announcements.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="flex items-start gap-2 rounded-lg border border-line bg-panel px-3 py-2">
                          <p className="flex-1 text-sm leading-6 text-ink">{ann.message}</p>
                          <form action={deactivateAnnouncementAction}>
                            <input type="hidden" name="id" value={ann.id} />
                            <input type="hidden" name="season_id" value={selectedSeason.id} />
                            <button
                              className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-warning"
                              title="Xóa thông báo"
                              aria-label="Xóa thông báo"
                            >
                              <X size={15} aria-hidden="true" />
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="grid gap-5 xl:grid-cols-2">
                  <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                    <h2 className="text-xl font-bold text-ink">Tạo đội</h2>
                    <form action={createTeamAction} className="mt-4 grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="season_id" value={selectedSeason.id} />
                      <input className={inputClass} name="team_id" placeholder="Mã đội (VD: 10A1)" required />
                      <input
                        className={inputClass}
                        name="team_name"
                        placeholder="Tên đội / lớp"
                        required
                      />
                      <input
                        className={inputClass}
                        name="password"
                        placeholder="Mật khẩu"
                        type="password"
                        required
                      />
                      <button className="focus-ring rounded-lg bg-circuit px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                        Thêm đội
                      </button>
                    </form>
                    <div className="mt-5 max-h-80 overflow-auto rounded-lg border border-line">
                      <table className="text-left text-sm">
                        <thead className="sticky top-0 bg-panel text-slate-600">
                          <tr>
                            <th className="px-3 py-2">Mã</th>
                            <th className="px-3 py-2">Đội</th>
                            <th className="px-3 py-2">Giải</th>
                            <th className="px-3 py-2">Sai</th>
                            <th className="px-3 py-2">Phiên</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.teams.map((team) => (
                            <tr className="border-t border-line" key={team.id}>
                              <td className="px-3 py-2 font-semibold">{team.team_id}</td>
                              <td className="px-3 py-2">{team.team_name}</td>
                              <td className="px-3 py-2">{team.solved}</td>
                              <td className="px-3 py-2 text-warning">{team.wrong_count}</td>
                              <td className="px-3 py-2">
                                {team.active_session_token ? (
                                  <form action={unlockTeamSessionAction}>
                                    <input type="hidden" name="season_id" value={selectedSeason.id} />
                                    <input type="hidden" name="team_id" value={team.team_id} />
                                    <button className="focus-ring rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink hover:bg-panel">
                                      Mở khóa
                                    </button>
                                  </form>
                                ) : (
                                  <span className="text-xs text-slate-400">Trống</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                      <DoorOpen size={20} aria-hidden="true" />
                      Tạo thử thách
                    </h2>
                    <form action={createChallengeAction} className="mt-4 grid gap-3">
                      <input type="hidden" name="season_id" value={selectedSeason.id} />
                      <div className="grid gap-3 md:grid-cols-[0.25fr_0.75fr]">
                        <input className={inputClass} name="door" placeholder="Cửa" type="number" required />
                        <input className={inputClass} name="title" placeholder="Tiêu đề" required />
                      </div>
                      <textarea
                        className={`${inputClass} min-h-24`}
                        name="mission"
                        placeholder="Nội dung nhiệm vụ"
                        required
                      />
                      <div className="grid gap-3 md:grid-cols-3">
                        <input className={inputClass} name="file_url" placeholder="File URL" />
                        <input className={inputClass} name="module" placeholder="Module" />
                        <input
                          className={inputClass}
                          name="difficulty"
                          placeholder="Độ khó"
                          type="number"
                          defaultValue={1}
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                        <input name="is_boss" type="checkbox" />
                        Cửa boss
                      </label>
                      <button className="focus-ring rounded-lg bg-circuit px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                        Thêm thử thách
                      </button>
                    </form>
                  </section>
                </section>

                <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                  <h2 className="text-xl font-bold text-ink">Danh sách thử thách</h2>
                  <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                    <table className="min-w-[920px] text-left text-sm">
                      <thead className="bg-panel text-slate-600">
                        <tr>
                          <th className="px-3 py-2">Cửa</th>
                          <th className="px-3 py-2">Tiêu đề</th>
                          <th className="px-3 py-2">Module</th>
                          <th className="px-3 py-2">Độ khó</th>
                          <th className="px-3 py-2">Tệp</th>
                          <th className="px-3 py-2">Tải lên</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.challenges.map((challenge) => (
                          <tr className="border-t border-line" key={challenge.id}>
                            <td className="px-3 py-3 font-bold text-signal">{challenge.door}</td>
                            <td className="px-3 py-3">
                              <p className="font-semibold text-ink">{challenge.title}</p>
                              {challenge.is_boss ? (
                                <span className="mt-1 inline-flex rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                                  Boss
                                </span>
                              ) : null}
                            </td>
                            <td className="px-3 py-3">{challenge.module ?? "—"}</td>
                            <td className="px-3 py-3">{challenge.difficulty}</td>
                            <td className="max-w-64 truncate px-3 py-3">
                              {challenge.file_url ? (
                                <a className="text-signal hover:underline" href={challenge.file_url}>
                                  Đã có tệp
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <form action={uploadChallengeFileAction} className="flex min-w-72 gap-2">
                                <input type="hidden" name="season_id" value={selectedSeason.id} />
                                <input type="hidden" name="challenge_id" value={challenge.id} />
                                <input type="hidden" name="door" value={challenge.door} />
                                <input
                                  className="focus-ring w-full rounded-lg border border-line bg-white px-2 py-2 text-xs"
                                  name="file"
                                  type="file"
                                  required
                                />
                                <button className="focus-ring inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                                  <Upload size={14} aria-hidden="true" />
                                  Tải
                                </button>
                              </form>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid gap-5 xl:grid-cols-3">
                  <ImportPanel type="teams" seasonId={selectedSeason.id} />
                  <ImportPanel type="challenges" seasonId={selectedSeason.id} />
                  <ImportPanel type="answers" seasonId={selectedSeason.id} />
                </section>

                <section className="grid gap-5 xl:grid-cols-[0.4fr_0.6fr]">
                  <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                    <h2 className="text-xl font-bold text-ink">Đội cần chú ý</h2>
                    <div className="mt-4 overflow-hidden rounded-lg border border-line">
                      <table className="text-left text-sm">
                        <thead className="bg-panel text-slate-600">
                          <tr>
                            <th className="px-3 py-2">Đội</th>
                            <th className="px-3 py-2">Sai</th>
                            <th className="px-3 py-2">Đã giải</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.suspiciousTeams.map((team) => (
                            <tr className="border-t border-line" key={team.id}>
                              <td className="px-3 py-2 font-semibold">{team.team_name}</td>
                              <td className="px-3 py-2 text-warning">{team.wrong_count}</td>
                              <td className="px-3 py-2">{team.solved}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                    <h2 className="text-xl font-bold text-ink">Nhật ký nộp bài</h2>
                    <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-line">
                      <table className="min-w-[760px] text-left text-sm">
                        <thead className="sticky top-0 bg-panel text-slate-600">
                          <tr>
                            <th className="px-3 py-2">Thời gian</th>
                            <th className="px-3 py-2">Đội</th>
                            <th className="px-3 py-2">Cửa</th>
                            <th className="px-3 py-2">Kết quả</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.submissions.map((submission) => (
                            <tr className="border-t border-line" key={submission.id}>
                              <td className="px-3 py-2">{formatDateTime(submission.created_at)}</td>
                              <td className="px-3 py-2 font-semibold">{submission.team_id}</td>
                              <td className="px-3 py-2">{submission.door}</td>
                              <td className="px-3 py-2">
                                <span className={
                                  submission.result === "correct"
                                    ? "font-bold text-emerald-700"
                                    : submission.result === "wrong"
                                      ? "text-red-600"
                                      : "text-slate-500"
                                }>
                                  {submission.result}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </section>
              </>
            ) : (
              <section className="rounded-xl border border-line bg-white p-8 text-center shadow-soft">
                <h2 className="text-2xl font-bold text-ink">Tạo mùa thi đầu tiên</h2>
                <p className="mt-2 text-slate-600">
                  Sau khi tạo mùa thi, bảng quản trị đội, thử thách và import CSV sẽ xuất hiện.
                </p>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
