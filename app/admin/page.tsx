import Link from "next/link";
import {
  ArchiveRestore,
  DoorOpen,
  LogOut,
  Plus,
  RadioTower,
  ShieldCheck,
  Upload
} from "lucide-react";
import {
  adminLogoutAction,
  createChallengeAction,
  createSeasonAction,
  createTeamAction,
  resetSeasonAction,
  updateSeasonStatusAction,
  uploadChallengeFileAction
} from "@/app/admin/actions";
import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { ImportPanel } from "@/app/admin/import-panel";
import { getAdminDashboardData } from "@/lib/admin-data";
import { formatDateTime, statusLabel } from "@/lib/format";
import { getAdminSession } from "@/lib/security/session";

export const dynamic = "force-dynamic";

const noticeText: Record<string, string> = {
  "season-created": "Đã tạo mùa thi.",
  "season-invalid": "Thông tin mùa thi chưa hợp lệ.",
  "status-updated": "Đã cập nhật trạng thái mùa thi.",
  "status-invalid": "Trạng thái mùa thi chưa hợp lệ.",
  "team-created": "Đã tạo đội.",
  "team-invalid": "Thông tin đội chưa hợp lệ.",
  "team-duplicate": "Mã đội đã tồn tại trong mùa này.",
  "challenge-created": "Đã tạo thử thách.",
  "challenge-invalid": "Thông tin thử thách chưa hợp lệ.",
  "challenge-duplicate": "Số cửa đã tồn tại trong mùa này.",
  "file-missing": "Chưa chọn tệp thử thách.",
  "file-invalid": "Thông tin tệp hoặc cửa chưa hợp lệ.",
  "file-too-large": "Tệp quá lớn. Giới hạn hiện tại là 25MB.",
  "challenge-missing": "Không tìm thấy thử thách tương ứng.",
  "file-uploaded": "Đã tải tệp thử thách.",
  "season-reset": "Đã đặt lại mùa thi về trạng thái nháp."
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
            <Link
              href="/leaderboard"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
            >
              <RadioTower size={17} aria-hidden="true" />
              Bảng xếp hạng
            </Link>
            <form action={adminLogoutAction}>
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
                <LogOut size={17} aria-hidden="true" />
                Thoát
              </button>
            </form>
          </div>
        </header>

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
                    </div>
                  </div>
                </section>

                <section className="grid gap-5 xl:grid-cols-2">
                  <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
                    <h2 className="text-xl font-bold text-ink">Tạo đội</h2>
                    <form action={createTeamAction} className="mt-4 grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="season_id" value={selectedSeason.id} />
                      <input className={inputClass} name="team_id" placeholder="Mã đội" required />
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
                          </tr>
                        </thead>
                        <tbody>
                          {data.teams.map((team) => (
                            <tr className="border-t border-line" key={team.id}>
                              <td className="px-3 py-2 font-semibold">{team.team_id}</td>
                              <td className="px-3 py-2">{team.team_name}</td>
                              <td className="px-3 py-2">{team.solved}</td>
                              <td className="px-3 py-2 text-warning">{team.wrong_count}</td>
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
                            <td className="px-3 py-3">{challenge.module ?? "-"}</td>
                            <td className="px-3 py-3">{challenge.difficulty}</td>
                            <td className="max-w-64 truncate px-3 py-3">
                              {challenge.file_url ? (
                                <a className="text-signal hover:underline" href={challenge.file_url}>
                                  Đã có tệp
                                </a>
                              ) : (
                                "-"
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
                  <ImportPanel type="teams" />
                  <ImportPanel type="challenges" />
                  <ImportPanel type="answers" />
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
                              <td className="px-3 py-2">{submission.result}</td>
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
