"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type Props = {
  endTime: string;
  tone?: "light" | "dark";
};

function formatDuration(ms: number) {
  if (ms <= 0) return "Đã hết giờ";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownTimer({ endTime, tone = "light" }: Props) {
  const [remaining, setRemaining] = useState(() => new Date(endTime).getTime() - Date.now());

  useEffect(() => {
    const tick = () => {
      setRemaining(new Date(endTime).getTime() - Date.now());
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endTime]);

  const isExpired = remaining <= 0;
  const isUrgent = remaining > 0 && remaining < 10 * 60 * 1000; // < 10 phút

  const className =
    tone === "dark"
      ? isExpired
        ? "border-white/15 bg-white/10 text-slate-300"
        : isUrgent
          ? "border-red-300/50 bg-red-500/15 text-red-100"
          : "border-emerald-300/40 bg-emerald-400/10 text-emerald-100"
      : isExpired
        ? "border-slate-300 bg-slate-100 text-slate-600"
        : isUrgent
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div
      className={`inline-flex min-w-[104px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${className}`}
    >
      <Clock
        size={15}
        aria-hidden="true"
        className={isUrgent && !isExpired ? "animate-pulse" : ""}
      />
      {isExpired ? "Đã hết giờ" : formatDuration(remaining)}
    </div>
  );
}
