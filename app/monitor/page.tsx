import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/security/session";
import { MonitorClient } from "@/app/monitor/monitor-client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MonitorData } from "@/app/api/monitor/route";
import type { Season } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Giám sát BGK — AI Quest Engine",
  description: "Màn hình theo dõi tiến độ cuộc thi dành cho ban giám khảo"
};

export default async function MonitorPage({
  searchParams
}: {
  searchParams: Promise<{ season_id?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const supabase = getSupabaseAdmin();

  const { data: seasons } = await supabase
    .from("seasons")
    .select("*")
    .order("created_at", { ascending: false });

  const seasonsList = (seasons ?? []) as Season[];
  const sorted = seasonsList.sort((a, b) => {
    const w = (s: string) => (s === "OPEN" ? 0 : s === "DRAFT" ? 1 : 2);
    return w(a.status) - w(b.status) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const season =
    (params.season_id ? seasonsList.find((s) => s.id === params.season_id) : null) ??
    sorted[0] ??
    null;

  let teams: MonitorData["teams"] = [];
  let totalDoors = 0;
  const doorDistribution: Record<number, number> = {};

  if (season) {
    const [teamsResult, doorsResult] = await Promise.all([
      supabase
        .from("teams")
        .select("id, team_id, team_name, solved, current_door, wrong_count, last_pass_time, created_at")
        .eq("season_id", season.id)
        .order("solved", { ascending: false })
        .order("last_pass_time", { ascending: true, nullsFirst: false }),
      supabase
        .from("challenges")
        .select("id", { count: "exact", head: true })
        .eq("season_id", season.id)
    ]);

    teams = teamsResult.data ?? [];
    totalDoors = doorsResult.count ?? 0;

    for (const team of teams) {
      const d = (team as { current_door: number }).current_door;
      doorDistribution[d] = (doorDistribution[d] ?? 0) + 1;
    }
  }

  const initialData: MonitorData = {
    season,
    teams: teams as MonitorData["teams"],
    totalDoors,
    doorDistribution,
    generatedAt: new Date().toISOString()
  };

  return <MonitorClient initialData={initialData} />;
}
