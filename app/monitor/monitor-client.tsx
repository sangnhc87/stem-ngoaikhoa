"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import type { MonitorData, MonitorTeam } from "@/app/api/monitor/route";

function getActivityStatus(lastPassTime: string | null, createdAt: string) {
  const lastActivity = lastPassTime ? new Date(lastPassTime) : new Date(createdAt);
  const minutesAgo = (Date.now() - lastActivity.getTime()) / 60000;

  if (!lastPassTime) return "idle";
  if (minutesAgo < 3) return "active";
  if (minutesAgo < 10) return "warning";
  return "inactive";
}

const statusConfig = {
  active: {
    dot: "bg-emerald-400",
    ring: "border-emerald-300 bg-emerald-50",
    text: "text-emerald-700",
    label: "Đang hoạt động"
  },
  warning: {
    dot: "bg-amber-400",
    ring: "border-amber-300 bg-amber-50",
    text: "text-amber-700",
    label: "5–10 phút"
  },
  inactive: {
    dot: "bg-red-400",
    ring: "border-red-300 bg-red-50",
    text: "text-red-700",
    label: ">10 phút"
  },
  idle: {
    dot: "bg-slate-300",
    ring: "border-slate-200 bg-slate-50",
    text: "text-slate-500",
    label: "Chưa bắt đầu"
  }
};

function TeamCard({ team, totalDoors }: { team: MonitorTeam; totalDoors: number }) {
  const status = getActivityStatus(team.last_pass_time, team.created_at);
  const cfg = statusConfig[status];
  const progress = totalDoors > 0 ? Math.min(100, (team.solved / totalDoors) * 100) : 0;

  const lastTime = team.last_pass_time
    ? new Date(team.last_pass_time).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "—";

  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 ${cfg.ring}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800">{team.team_name}</p>
          <p className="text-xs text-slate-500">{team.team_id}</p>
        </div>
        <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-circuit transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1 text-center text-xs">
        <div>
          <p className="font-black text-emerald-700">{team.solved}</p>
          <p className="text-slate-500">đã giải</p>
        </div>
        <div>
          <p className="font-black text-slate-800">{team.current_door}/{totalDoors || "?"}</p>
          <p className="text-slate-500">cửa</p>
        </div>
        <div>
          <p className="font-black text-amber-700">{team.wrong_count}</p>
          <p className="text-slate-500">sai</p>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-400">
        {lastTime}
      </p>
    </div>
  );
}

function DoorHeatmap({ distribution, totalDoors }: { distribution: Record<number, number>; totalDoors: number }) {
  if (totalDoors === 0) return null;

  const max = Math.max(1, ...Object.values(distribution));
  const doors = Array.from({ length: totalDoors }, (_, i) => i + 1);

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-soft">
      <h2 className="text-base font-bold text-ink">Phân bố đội theo cửa</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {doors.map((door) => {
          const count = distribution[door] ?? 0;
          const intensity = count === 0 ? 0 : Math.ceil((count / max) * 5);
          const colorClass = [
            "bg-slate-100 text-slate-400",
            "bg-circuit/20 text-circuit",
            "bg-circuit/40 text-circuit",
            "bg-circuit/60 text-white",
            "bg-circuit/80 text-white",
            "bg-circuit text-white"
          ][intensity];

          return (
            <div
              key={door}
              title={`Cửa ${door}: ${count} đội`}
              className={`flex h-10 w-10 flex-col items-center justify-center rounded-lg text-xs font-bold transition-all ${colorClass}`}
            >
              <span>{door}</span>
              <span className="text-[10px] opacity-80">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MonitorClient({ initialData }: { initialData: MonitorData }) {
  const [data, setData] = useState<MonitorData>(initialData);
  const [isConnected, setIsConnected] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/monitor${data.season?.id ? `?season_id=${data.season.id}` : ""}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        setData(await res.json());
        setIsConnected(true);
        setLastRefresh(new Date());
      } else if (res.status === 401) {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    }
  }, [data.season?.id]);

  useEffect(() => {
    const timer = window.setInterval(refresh, 8_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const stats = {
    active: data.teams.filter((t) => getActivityStatus(t.last_pass_time, t.created_at) === "active").length,
    warning: data.teams.filter((t) => getActivityStatus(t.last_pass_time, t.created_at) === "warning").length,
    inactive: data.teams.filter((t) => getActivityStatus(t.last_pass_time, t.created_at) === "inactive").length,
    idle: data.teams.filter((t) => getActivityStatus(t.last_pass_time, t.created_at) === "idle").length
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-6 flex flex-col gap-4 rounded-xl border border-line bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-circuit">
              Bảng điều khiển BGK
            </p>
            <h1 className="mt-1 text-2xl font-black text-ink">
              {data.season?.name ?? "Chưa có mùa thi"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {stats.active} đang thi
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                {stats.warning}
              </span>
              <span className="flex items-center gap-1 font-semibold text-red-700">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                {stats.inactive}
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                {stats.idle} chưa bắt đầu
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isConnected ? (
                <Wifi size={14} className="text-emerald-500" />
              ) : (
                <WifiOff size={14} className="text-red-500" />
              )}
              <span>
                {lastRefresh.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </span>
              <button
                onClick={refresh}
                className="ml-1 rounded-md p-1 hover:bg-slate-100"
                title="Làm mới ngay"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <DoorHeatmap distribution={data.doorDistribution} totalDoors={data.totalDoors} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {data.teams.map((team) => (
            <TeamCard key={team.id} team={team} totalDoors={data.totalDoors} />
          ))}
          {data.teams.length === 0 && (
            <div className="col-span-full rounded-xl border border-line bg-white p-10 text-center text-slate-500">
              Chưa có đội trong mùa thi này.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
