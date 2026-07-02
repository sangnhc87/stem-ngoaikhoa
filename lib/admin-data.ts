import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Challenge, Season, Submission, Team } from "@/lib/types";

export type AdminTeam = Omit<Team, "password_hash">;

export type AdminDashboardData = {
  seasons: Season[];
  selectedSeason: Season | null;
  teams: AdminTeam[];
  challenges: Challenge[];
  submissions: Submission[];
  suspiciousTeams: AdminTeam[];
};

export async function getAdminDashboardData(selectedSeasonId?: string): Promise<AdminDashboardData> {
  const supabase = getSupabaseAdmin();
  const { data: seasonsData, error: seasonsError } = await supabase
    .from("seasons")
    .select("*")
    .order("created_at", { ascending: false });

  if (seasonsError) {
    throw new Error(seasonsError.message);
  }

  const seasons = (seasonsData ?? []) as Season[];
  const selectedSeason =
    seasons.find((season) => season.id === selectedSeasonId) ?? seasons[0] ?? null;

  if (!selectedSeason) {
    return {
      seasons,
      selectedSeason: null,
      teams: [],
      challenges: [],
      submissions: [],
      suspiciousTeams: []
    };
  }

  const [teamsResult, challengesResult, submissionsResult, suspiciousResult] = await Promise.all([
    supabase
      .from("teams")
      .select(
        "id, season_id, team_id, team_name, current_door, solved, wrong_count, last_pass_time, active_session_token, active_session_at, created_at"
      )
      .eq("season_id", selectedSeason.id)
      .order("team_id", { ascending: true }),
    supabase
      .from("challenges")
      .select("*")
      .eq("season_id", selectedSeason.id)
      .order("door", { ascending: true }),
    supabase
      .from("submissions")
      .select("*")
      .eq("season_id", selectedSeason.id)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("teams")
      .select(
        "id, season_id, team_id, team_name, current_door, solved, wrong_count, last_pass_time, active_session_token, active_session_at, created_at"
      )
      .eq("season_id", selectedSeason.id)
      .order("wrong_count", { ascending: false })
      .limit(20)
  ]);

  for (const result of [teamsResult, challengesResult, submissionsResult, suspiciousResult]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  return {
    seasons,
    selectedSeason,
    teams: (teamsResult.data ?? []) as AdminTeam[],
    challenges: (challengesResult.data ?? []) as Challenge[],
    submissions: (submissionsResult.data ?? []) as Submission[],
    suspiciousTeams: (suspiciousResult.data ?? []) as AdminTeam[]
  };
}
