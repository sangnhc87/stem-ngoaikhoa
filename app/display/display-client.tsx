"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LeaderboardTeam, Season } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { CountdownTimer } from "@/components/countdown-timer";

type DisplayPayload = {
  season: Season | null;
  teams: LeaderboardTeam[];
};

type Announcement = {
  id: string;
  message: string;
};

const PAGE_SIZE = 12;

export function DisplayClient({ initialData }: { initialData: DisplayPayload }) {
  const [data, setData] = useState(initialData);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<"all" | 10 | 20 | 30>("all");
  const [pageIndex, setPageIndex] = useState(0);
  const prevTeamsRef = useRef<Map<string, number>>(new Map());
  const [rankChanges, setRankChanges] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const [lbRes, annRes] = await Promise.all([
        fetch("/api/leaderboard?limit=100", { cache: "no-store" }),
        data.season?.id
          ? fetch(`/api/announcements?season_id=${data.season.id}`, { cache: "no-store" })
          : Promise.resolve(null)
      ]);

      if (lbRes.ok) {
        const newData: DisplayPayload = await lbRes.json();

        const changes = new Set<string>();
        for (const team of newData.teams) {
          const prevRank = prevTeamsRef.current.get(team.team_name);
          if (prevRank !== undefined && prevRank !== team.rank) {
            changes.add(team.team_name);
          }
        }

        if (changes.size > 0) {
          setRankChanges(changes);
          setTimeout(() => setRankChanges(new Set()), 2000);
        }

        prevTeamsRef.current = new Map(newData.teams.map((t) => [t.team_name, t.rank]));
        setData(newData);
      }

      if (annRes?.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements ?? []);
      }
    } catch {
      // ignore
    }
  }, [data.season?.id]);

  useEffect(() => {
    const timer = window.setInterval(refresh, 5_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const filteredTeams =
    filter === "all" ? data.teams : data.teams.slice(0, filter);

  const totalPages = Math.ceil(filteredTeams.length / PAGE_SIZE);
  const shouldScroll = filteredTeams.length > PAGE_SIZE;

  useEffect(() => {
    if (!shouldScroll) {
      setPageIndex(0);
      return;
    }
    const scrollTimer = window.setInterval(() => {
      setPageIndex((prev) => (prev + 1) % totalPages);
    }, 8_000);
    return () => window.clearInterval(scrollTimer);
  }, [shouldScroll, totalPages]);

  const visibleTeams = shouldScroll
    ? filteredTeams.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)
    : filteredTeams;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-white md:px-6">
      <header className="mb-6 flex flex-col gap-5 border-b border-white/15 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300 md:text-base">
            AI Quest Engine
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
            {data.season?.name ?? "Chưa có mùa thi"}
          </h1>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          {data.season?.end_time && data.season?.status === "OPEN" && (
            <CountdownTimer endTime={data.season.end_time} tone="dark" />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {(["all", 10, 20, 30] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPageIndex(0);
                }}
                className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                  filter === f
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {f === "all" ? "Tất cả" : `Top ${f}`}
              </button>
            ))}
          </div>
          <div className="lg:text-right">
            <p className="text-lg font-bold text-emerald-300">
              {filteredTeams.length} đội
              {shouldScroll ? ` · Trang ${pageIndex + 1}/${totalPages}` : ""}
            </p>
            <p className="text-sm text-slate-400">Tự cập nhật 5 giây</p>
          </div>
        </div>
      </header>

      <section className="grid gap-2.5 overflow-x-auto pb-2">
        {visibleTeams.map((team) => {
          const isChanged = rankChanges.has(team.team_name);
          return (
            <article
              key={`${team.rank}-${team.team_name}`}
              className={`grid min-w-[820px] grid-cols-[86px_1fr_112px_112px_112px] items-center gap-4 rounded-lg px-5 py-4 transition-all duration-700 lg:min-w-0 ${
                isChanged
                  ? "border border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(0,200,255,0.3)]"
                  : "border border-white/10 bg-white/[0.06]"
              }`}
            >
              <div className="text-4xl font-black text-cyan-300 md:text-5xl">#{team.rank}</div>
              <div>
                <h2 className="truncate text-2xl font-black md:text-3xl">{team.team_name}</h2>
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
          );
        })}

        {visibleTeams.length === 0 && (
          <div className="py-20 text-center text-slate-500">Chưa có đội trong mùa thi.</div>
        )}
      </section>

      {/* Thanh tiến trình trang (khi cuộn) */}
      {shouldScroll && (
        <div className="mt-6 flex justify-center gap-2" aria-label="Chuyển trang bảng xếp hạng">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPageIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === pageIndex ? "w-8 bg-cyan-400" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}

      {announcements.length > 0 && (
        <div className="fixed bottom-5 right-5 z-20 max-w-sm space-y-2">
          {announcements.slice(0, 2).map((ann) => (
            <div
              key={ann.id}
              className="rounded-xl border border-amber-300/50 bg-amber-900/90 px-4 py-3 text-sm font-semibold leading-6 text-amber-50 shadow-lg backdrop-blur"
            >
              {ann.message}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
