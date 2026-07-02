"use client";

import { useEffect, useState } from "react";
import type { LeaderboardTeam, Season } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

type DisplayPayload = {
  season: Season | null;
  teams: LeaderboardTeam[];
};

export function DisplayClient({ initialData }: { initialData: DisplayPayload }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const refresh = async () => {
      const response = await fetch("/api/leaderboard?limit=15", { cache: "no-store" });
      if (response.ok) {
        setData(await response.json());
      }
    };

    const timer = window.setInterval(refresh, 5_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8 text-white">
      <header className="mb-8 flex items-end justify-between gap-6 border-b border-white/15 pb-6">
        <div>
          <p className="text-xl font-bold uppercase tracking-[0.18em] text-cyan-300">
            AI Quest Engine
          </p>
          <h1 className="mt-3 text-5xl font-black leading-tight">{data.season?.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-300">Top 15</p>
          <p className="mt-1 text-lg text-slate-300">Tự cập nhật 5 giây</p>
        </div>
      </header>

      <section className="grid gap-3">
        {data.teams.map((team) => (
          <article
            key={`${team.rank}-${team.team_name}`}
            className="grid grid-cols-[90px_1fr_130px_140px_120px] items-center gap-5 rounded-lg border border-white/10 bg-white/[0.06] px-6 py-4"
          >
            <div className="text-5xl font-black text-cyan-300">#{team.rank}</div>
            <div>
              <h2 className="text-3xl font-black">{team.team_name}</h2>
              <p className="mt-1 text-lg text-slate-300">
                Lần mở: {formatDateTime(team.last_pass_time)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.12em] text-slate-400">Đã giải</p>
              <p className="mt-1 text-4xl font-black text-emerald-300">{team.solved}</p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.12em] text-slate-400">Cửa</p>
              <p className="mt-1 text-4xl font-black text-white">{team.current_door}</p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.12em] text-slate-400">Sai</p>
              <p className="mt-1 text-4xl font-black text-amber-300">{team.wrong_count}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
