"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

type Announcement = {
  id: string;
  message: string;
  created_at: string;
};

type Props = {
  seasonId: string;
  initialAnnouncements: Announcement[];
};

export function AnnouncementBanner({ seasonId, initialAnnouncements }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch(`/api/announcements?season_id=${seasonId}`, {
          cache: "no-store"
        });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements ?? []);
        }
      } catch {
        // ignore
      }
    };

    const timer = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(timer);
  }, [seasonId]);

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((ann) => (
        <div
          key={ann.id}
          className="flex items-start gap-3 rounded-xl border border-warning/30 bg-amber-50 px-4 py-3 shadow-sm"
          role="alert"
        >
          <Megaphone size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <p className="flex-1 text-sm font-semibold leading-6 text-ink">{ann.message}</p>
          <button
            onClick={() => setDismissed((prev) => new Set([...prev, ann.id]))}
            className="shrink-0 rounded-md p-1 text-warning hover:bg-amber-100"
            aria-label="Ẩn thông báo"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
