export type SeasonStatus = "DRAFT" | "OPEN" | "CLOSED";

export type Season = {
  id: string;
  name: string;
  year: number | null;
  theme: string | null;
  status: SeasonStatus;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
};

export type Team = {
  id: string;
  season_id: string;
  team_id: string;
  team_name: string;
  password_hash: string;
  current_door: number;
  solved: number;
  wrong_count: number;
  last_pass_time: string | null;
  created_at: string;
};

export type Challenge = {
  id: string;
  season_id: string;
  door: number;
  title: string;
  mission: string;
  file_url: string | null;
  difficulty: number;
  module: string | null;
  is_boss: boolean;
  created_at: string;
};

export type Submission = {
  id: string;
  season_id: string;
  team_id: string;
  door: number;
  submitted_key_hash: string | null;
  result: "correct" | "wrong" | "closed" | "invalid" | "rate_limited";
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
};

export type LeaderboardTeam = {
  rank: number;
  team_name: string;
  solved: number;
  current_door: number;
  last_pass_time: string | null;
  wrong_count: number;
};
