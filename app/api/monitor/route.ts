import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/security/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Season } from "@/lib/types";

export const dynamic = "force-dynamic";

export type MonitorTeam = {
  id: string;
  team_id: string;
  team_name: string;
  solved: number;
  current_door: number;
  wrong_count: number;
  last_pass_time: string | null;
  created_at: string;
};

export type MonitorData = {
  season: Season | null;
  teams: MonitorTeam[];
  totalDoors: number;
  doorDistribution: Record<number, number>;
  generatedAt: string;
};

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Truy cập bị từ chối." }, { status: 401 });
  }

  const seasonId = request.nextUrl.searchParams.get("season_id");
  const supabase = getSupabaseAdmin();

  let seasonQuery = supabase.from("seasons").select("*").order("created_at", { ascending: false });
  if (seasonId) {
    seasonQuery = supabase.from("seasons").select("*").eq("id", seasonId);
  }

  const { data: seasons } = await seasonQuery;
  const seasonsList = (seasons ?? []) as Season[];

  const sorted = seasonsList.sort((a, b) => {
    const w = (s: string) => (s === "OPEN" ? 0 : s === "DRAFT" ? 1 : 2);
    return w(a.status) - w(b.status) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const season = sorted[0] ?? null;

  if (!season) {
    return NextResponse.json({
      season: null,
      teams: [],
      totalDoors: 0,
      doorDistribution: {},
      generatedAt: new Date().toISOString()
    } satisfies MonitorData);
  }

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

  const teams = (teamsResult.data ?? []) as MonitorTeam[];
  const totalDoors = doorsResult.count ?? 0;

  const doorDistribution: Record<number, number> = {};
  for (const team of teams) {
    const d = team.current_door;
    doorDistribution[d] = (doorDistribution[d] ?? 0) + 1;
  }

  return NextResponse.json({
    season,
    teams,
    totalDoors,
    doorDistribution,
    generatedAt: new Date().toISOString()
  } satisfies MonitorData);
}
