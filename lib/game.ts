import "server-only";

import { headers } from "next/headers";
import { getServerEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashAnswerKey, hashIpAddress, verifyPassword } from "@/lib/security/hash";
import type { Challenge, Season, Team } from "@/lib/types";

export type TeamContext = {
  season: Season;
  team: Team;
  challenge: Challenge | null;
  totalDoors: number;
};

type TeamLoginRow = Pick<
  Team,
  | "id"
  | "season_id"
  | "team_id"
  | "team_name"
  | "password_hash"
  | "current_door"
  | "solved"
  | "wrong_count"
  | "last_pass_time"
  | "created_at"
> & {
  seasons:
    | {
        id: string;
        name: string;
        status: string;
        created_at: string;
      }
    | {
        id: string;
        name: string;
        status: string;
        created_at: string;
      }[]
    | null;
};

export async function authenticateTeam(teamId: string, password: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("teams")
    .select(
      "id, season_id, team_id, team_name, password_hash, current_door, solved, wrong_count, last_pass_time, created_at, seasons(id, name, status, created_at)"
    )
    .eq("team_id", teamId.trim())
    .limit(20);

  if (error || !data?.length) {
    return null;
  }

  const rows = data as unknown as TeamLoginRow[];
  const sorted = rows
    .map((row) => ({
      ...row,
      seasonStatus: Array.isArray(row.seasons)
        ? row.seasons[0]?.status
        : row.seasons?.status,
      seasonCreatedAt: Array.isArray(row.seasons)
        ? row.seasons[0]?.created_at
        : row.seasons?.created_at
    }))
    .sort((left, right) => {
      const statusWeight = (status: string | undefined) =>
        status === "OPEN" ? 0 : status === "DRAFT" ? 1 : 2;
      const byStatus = statusWeight(left.seasonStatus) - statusWeight(right.seasonStatus);

      if (byStatus !== 0) {
        return byStatus;
      }

      return (
        new Date(right.seasonCreatedAt || 0).getTime() -
        new Date(left.seasonCreatedAt || 0).getTime()
      );
    });

  for (const team of sorted) {
    if (await verifyPassword(password, team.password_hash)) {
      return {
        teamUuid: team.id,
        seasonId: team.season_id
      };
    }
  }

  return null;
}

export async function getTeamContext(
  teamUuid: string,
  sessionSeasonId: string
): Promise<TeamContext | null> {
  const supabase = getSupabaseAdmin();
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamUuid)
    .eq("season_id", sessionSeasonId)
    .maybeSingle<Team>();

  if (teamError || !team) {
    return null;
  }

  const [{ data: season }, { data: challenge }, { count }] = await Promise.all([
    supabase.from("seasons").select("*").eq("id", team.season_id).single<Season>(),
    supabase
      .from("challenges")
      .select("*")
      .eq("season_id", team.season_id)
      .eq("door", team.current_door)
      .maybeSingle<Challenge>(),
    supabase
      .from("challenges")
      .select("id", { count: "exact", head: true })
      .eq("season_id", team.season_id)
  ]);

  if (!season) {
    return null;
  }

  return {
    season,
    team,
    challenge: challenge ?? null,
    totalDoors: count ?? 0
  };
}

export async function getRequestFingerprint() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const userAgent = headerList.get("user-agent");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp;
  const { ipHashSecret } = getServerEnv();

  return {
    userAgent,
    ipHash: hashIpAddress(ip ?? null, ipHashSecret)
  };
}

export async function submitKeyAttempt(
  teamUuid: string,
  sessionSeasonId: string,
  submittedKey: string
) {
  const supabase = getSupabaseAdmin();
  const env = getServerEnv();
  const { userAgent, ipHash } = await getRequestFingerprint();
  const submittedKeyHash = hashAnswerKey(submittedKey, env.answerHashSecret);

  const { data, error } = await supabase.rpc("submit_key_attempt", {
    p_team_uuid: teamUuid,
    p_session_season_id: sessionSeasonId,
    p_submitted_key_hash: submittedKeyHash,
    p_user_agent: userAgent,
    p_ip_hash: ipHash
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    result: "correct" | "wrong" | "closed" | "invalid" | "rate_limited";
    message: string;
    solved?: number;
    current_door?: number;
  };
}
