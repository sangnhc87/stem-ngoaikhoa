import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { hashAnswerKey, hashPassword } from "../lib/security/hash";

config({ path: ".env.local" });
config();

type RequiredEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "ANSWER_HASH_SECRET";

type CheckResult = {
  name: string;
  ok: boolean;
  detail?: string;
};

const results: CheckResult[] = [];

function pass(name: string, detail?: string) {
  results.push({ name, ok: true, detail });
  console.log(`PASS: ${name}${detail ? ` - ${detail}` : ""}`);
}

function fail(name: string, detail?: string) {
  results.push({ name, ok: false, detail });
  console.error(`FAIL: ${name}${detail ? ` - ${detail}` : ""}`);
}

function required(key: RequiredEnvKey) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Thieu bien moi truong ${key}. Hay dien .env.local truoc.`);
  }
  return value;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
const answerSecret = required("ANSWER_HASH_SECRET");

async function countRows(table: string) {
  const { count, error } = await supabase.from(table).select("id", {
    count: "exact",
    head: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function checkBaseData() {
  const seasonCount = await countRows("seasons");
  if (seasonCount > 0) {
    pass("Co it nhat 1 mua thi", `${seasonCount} mua`);
  } else {
    fail("Co it nhat 1 mua thi", "Chua co season. Hay chay pnpm seed.");
  }

  const teamCount = await countRows("teams");
  if (teamCount > 0) {
    pass("Co doi thi", `${teamCount} doi`);
  } else {
    fail("Co doi thi", "Chua co team. Hay chay pnpm seed hoac import teams.csv.");
  }

  const challengeCount = await countRows("challenges");
  if (challengeCount > 0) {
    pass("Co thu thach", `${challengeCount} thu thach`);
  } else {
    fail("Co thu thach", "Chua co challenge. Hay chay pnpm seed hoac import challenges.csv.");
  }

  const answerCount = await countRows("answers");
  if (answerCount > 0) {
    pass("Co dap an da hash", `${answerCount} dap an`);
  } else {
    fail("Co dap an da hash", "Chua co answer. Hay chay pnpm seed hoac import answers.csv.");
  }
}

async function createTemporaryFlowData() {
  const suffix = Date.now().toString(36);
  const teamId = `FLOW-${suffix}`;
  const correctKey = `FLOW-KEY-${suffix.toUpperCase()}`;

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .insert({
      name: `Automated Flow Test ${suffix}`,
      year: 2026,
      theme: "Kiem tra tu dong",
      status: "OPEN",
      start_time: new Date().toISOString()
    })
    .select("id")
    .single();

  if (seasonError) {
    throw new Error(seasonError.message);
  }

  const passwordHash = await hashPassword("flow-test-password");
  const teamInsert = await supabase.from("teams").insert({
    season_id: season.id,
    team_id: teamId,
    team_name: "Doi test tu dong",
    password_hash: passwordHash,
    current_door: 1,
    solved: 0,
    wrong_count: 0
  });

  if (teamInsert.error) {
    throw new Error(teamInsert.error.message);
  }

  const challengeInsert = await supabase.from("challenges").insert({
    season_id: season.id,
    door: 1,
    title: "Cua test tu dong",
    mission: "Dung cho script test-local-flow.ts",
    difficulty: 1,
    module: "Test",
    is_boss: false
  });

  if (challengeInsert.error) {
    throw new Error(challengeInsert.error.message);
  }

  const answerInsert = await supabase.from("answers").insert({
    season_id: season.id,
    team_id: teamId,
    door: 1,
    answer_hash: hashAnswerKey(correctKey, answerSecret)
  });

  if (answerInsert.error) {
    throw new Error(answerInsert.error.message);
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, current_door, solved, wrong_count")
    .eq("season_id", season.id)
    .eq("team_id", teamId)
    .single();

  if (teamError) {
    throw new Error(teamError.message);
  }

  return {
    seasonId: season.id as string,
    teamUuid: team.id as string,
    teamId,
    correctKey
  };
}

async function runRpcFlow() {
  const temp = await createTemporaryFlowData();

  try {
    const wrongHash = hashAnswerKey("SAI-DAP-AN", answerSecret);
    const wrongResult = await supabase.rpc("submit_key_attempt", {
      p_team_uuid: temp.teamUuid,
      p_session_season_id: temp.seasonId,
      p_submitted_key_hash: wrongHash,
      p_user_agent: "test-local-flow",
      p_ip_hash: "test-local-flow"
    });

    if (wrongResult.error) {
      throw new Error(wrongResult.error.message);
    }

    if (wrongResult.data?.result === "wrong") {
      pass("RPC ghi nhan khoa sai");
    } else {
      fail("RPC ghi nhan khoa sai", `Ket qua nhan duoc: ${JSON.stringify(wrongResult.data)}`);
    }

    await sleep(3200);

    const correctResult = await supabase.rpc("submit_key_attempt", {
      p_team_uuid: temp.teamUuid,
      p_session_season_id: temp.seasonId,
      p_submitted_key_hash: hashAnswerKey(temp.correctKey, answerSecret),
      p_user_agent: "test-local-flow",
      p_ip_hash: "test-local-flow"
    });

    if (correctResult.error) {
      throw new Error(correctResult.error.message);
    }

    if (correctResult.data?.result === "correct") {
      pass("RPC mo khoa dung");
    } else {
      fail("RPC mo khoa dung", `Ket qua nhan duoc: ${JSON.stringify(correctResult.data)}`);
    }

    const { data: updatedTeam, error: teamError } = await supabase
      .from("teams")
      .select("solved, current_door, wrong_count")
      .eq("id", temp.teamUuid)
      .single();

    if (teamError) {
      throw new Error(teamError.message);
    }

    if (updatedTeam.solved === 1 && updatedTeam.current_door === 2 && updatedTeam.wrong_count === 1) {
      pass("Tien do doi cap nhat dung", "solved=1, current_door=2, wrong_count=1");
    } else {
      fail("Tien do doi cap nhat dung", JSON.stringify(updatedTeam));
    }

    const { data: leaderboardRows, error: leaderboardError } = await supabase
      .from("teams")
      .select("team_name, solved, current_door, last_pass_time, wrong_count")
      .eq("season_id", temp.seasonId)
      .order("solved", { ascending: false })
      .order("last_pass_time", { ascending: true, nullsFirst: false })
      .order("wrong_count", { ascending: true });

    if (leaderboardError) {
      throw new Error(leaderboardError.message);
    }

    if (leaderboardRows && leaderboardRows.length > 0) {
      pass("Doc duoc du lieu leaderboard");
    } else {
      fail("Doc duoc du lieu leaderboard", "Khong co dong leaderboard nao.");
    }
  } finally {
    const { error } = await supabase.from("seasons").delete().eq("id", temp.seasonId);
    if (error) {
      console.warn(`CANH BAO: Khong xoa duoc season test tam: ${error.message}`);
    } else {
      console.log("Da xoa du lieu test tam.");
    }
  }
}

async function main() {
  console.log("\n=== Kiem tra local flow AI Quest Engine ===\n");
  await checkBaseData();
  await runRpcFlow();

  const failed = results.filter((result) => !result.ok);
  console.log("\n=== Tong ket ===");
  console.log(`PASS: ${results.length - failed.length}`);
  console.log(`FAIL: ${failed.length}`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
