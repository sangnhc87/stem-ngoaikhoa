import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LeaderboardTeam, Season, Team } from "@/lib/types";

export async function getCurrentSeason() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return null;
  }

  const sorted = (data as Season[]).sort((left, right) => {
    const weight = (status: string) => (status === "OPEN" ? 0 : status === "DRAFT" ? 1 : 2);
    const byStatus = weight(left.status) - weight(right.status);
    if (byStatus !== 0) {
      return byStatus;
    }
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });

  return sorted[0] ?? null;
}

export async function getLeaderboard(limit?: number) {
  const supabase = getSupabaseAdmin();
  const season = await getCurrentSeason();
  const safeLimit =
    typeof limit === "number" && Number.isInteger(limit) && limit > 0
      ? Math.min(limit, 100)
      : undefined;

  if (!season) {
    return {
      season: null,
      teams: [] as LeaderboardTeam[]
    };
  }

  let query = supabase
    .from("teams")
    .select("team_name, solved, current_door, last_pass_time, wrong_count")
    .eq("season_id", season.id)
    .order("solved", { ascending: false })
    .order("last_pass_time", { ascending: true, nullsFirst: false })
    .order("wrong_count", { ascending: true })
    .order("team_name", { ascending: true });

  if (safeLimit) {
    query = query.limit(safeLimit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    season,
    teams: ((data ?? []) as Pick<
      Team,
      "team_name" | "solved" | "current_door" | "last_pass_time" | "wrong_count"
    >[]).map((team, index) => ({
      rank: index + 1,
      team_name: team.team_name,
      solved: team.solved,
      current_door: team.current_door,
      last_pass_time: team.last_pass_time,
      wrong_count: team.wrong_count
    }))
  };
}
