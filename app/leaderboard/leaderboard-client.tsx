"use client";

import { useEffect, useState } from "react";
import type { LeaderboardTeam, Season } from "@/lib/types";
import { formatDateTime, statusLabel } from "@/lib/format";

type LeaderboardPayload = {
  season: Season | null;
  teams: LeaderboardTeam[];
  generatedAt?: string;
};

export function LeaderboardClient({ initialData }: { initialData: LeaderboardPayload }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const refresh = async () => {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      if (response.ok) {
        setData(await response.json());
      }
    };

    const timer = window.setInterval(refresh, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
      <div className="flex flex-col gap-2 border-b border-line px-5 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-circuit">
            Bảng xếp hạng
          </p>
          <h1 className="mt-2 text-2xl font-bold text-ink md:text-3xl">
            {data.season?.name ?? "Chưa có mùa thi"}
          </h1>
        </div>
        {data.season ? (
          <p className="text-sm font-semibold text-slate-600">
            {statusLabel(data.season.status)} · cập nhật tự động 10 giây
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] text-left">
          <thead className="bg-panel text-sm text-slate-600">
            <tr>
              <th className="px-5 py-3">Hạng</th>
              <th className="px-5 py-3">Đội</th>
              <th className="px-5 py-3">Đã giải</th>
              <th className="px-5 py-3">Cửa hiện tại</th>
              <th className="px-5 py-3">Lần mở gần nhất</th>
              <th className="px-5 py-3">Sai</th>
            </tr>
          </thead>
          <tbody>
            {data.teams.map((team) => (
              <tr key={`${team.rank}-${team.team_name}`} className="border-t border-line">
                <td className="px-5 py-4 text-lg font-bold text-signal">#{team.rank}</td>
                <td className="px-5 py-4 font-semibold text-ink">{team.team_name}</td>
                <td className="px-5 py-4">{team.solved}</td>
                <td className="px-5 py-4">{team.current_door}</td>
                <td className="px-5 py-4">{formatDateTime(team.last_pass_time)}</td>
                <td className="px-5 py-4 text-warning">{team.wrong_count}</td>
              </tr>
            ))}
            {data.teams.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                  Chưa có đội trong mùa thi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
