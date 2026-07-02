import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { hashAnswerKey, hashPassword } from "../lib/security/hash";

config({ path: ".env.local" });
config();

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANSWER_HASH_SECRET"
] as const;

const outputPath = resolve(process.cwd(), "test-keys-output.txt");
const seasonName = "AI Quest 2026: Giải cứu Phòng thí nghiệm STEM";
const teamPassword = "123456";

const teams = [
  { team_id: "T01", team_name: "10A1" },
  { team_id: "T02", team_name: "10A2" },
  { team_id: "T03", team_name: "10A3" }
];

const challenges = [
  {
    door: 1,
    title: "Tín hiệu đầu tiên",
    mission:
      "Phòng thí nghiệm vừa mất điện. Hãy dùng dữ kiện trong thông báo khẩn để xác định mã khởi động lại trạm điều khiển.",
    difficulty: 1,
    module: "Khởi động",
    is_boss: false
  },
  {
    door: 2,
    title: "Bản đồ cảm biến",
    mission:
      "Một cảm biến gửi về chuỗi số nhiễu. Phân tích quy luật và tìm khóa để mở tủ thiết bị AI.",
    difficulty: 2,
    module: "Dữ liệu",
    is_boss: false
  },
  {
    door: 3,
    title: "Mô hình bị khóa",
    mission:
      "Mô hình trợ lý bị khóa bởi một prompt lỗi. Hãy kiểm tra nhật ký, sửa giả thuyết và suy ra khóa xác thực.",
    difficulty: 3,
    module: "AI",
    is_boss: false
  },
  {
    door: 4,
    title: "Mạch an toàn",
    mission:
      "Hệ thống an toàn yêu cầu một chuỗi điều kiện logic. Dùng bảng chân trị để tìm tổ hợp đúng.",
    difficulty: 4,
    module: "Logic",
    is_boss: false
  },
  {
    door: 5,
    title: "Lõi phản ứng STEM",
    mission:
      "Cửa cuối cùng nối ba manh mối trước đó. Ghép dữ kiện, kiểm tra bằng AI và nhập khóa giải cứu phòng thí nghiệm.",
    difficulty: 5,
    module: "Boss",
    is_boss: true
  }
];

function readRequiredEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Thieu bien moi truong: ${missing.join(", ")}. Hay dien .env.local truoc.`);
  }

  const answerHashSecret = process.env.ANSWER_HASH_SECRET as string;
  if (answerHashSecret.length < 32) {
    throw new Error("ANSWER_HASH_SECRET phai co it nhat 32 ky tu.");
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    answerHashSecret
  };
}

const env = readRequiredEnv();
const supabase = createClient(env.supabaseUrl, env.serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function assertTablesExist() {
  const tables = ["seasons", "teams", "challenges", "answers", "submissions", "files"];

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id", { head: true, count: "exact" });
    if (error) {
      throw new Error(
        `Khong doc duoc bang ${table}. Hay chay SQL migration truoc. Loi Supabase: ${error.message}`
      );
    }
  }
}

async function findOrCreateSeason() {
  const { data: existing, error: existingError } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("name", seasonName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("seasons")
      .update({
        year: 2026,
        theme: "Giải cứu Phòng thí nghiệm STEM",
        status: "DRAFT",
        start_time: null,
        end_time: null
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return existing;
  }

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .insert({
      name: seasonName,
      year: 2026,
      theme: "Giải cứu Phòng thí nghiệm STEM",
      status: "DRAFT"
    })
    .select("id, name")
    .single();

  if (seasonError) {
    throw new Error(seasonError.message);
  }

  return season;
}

async function upsertTeams(seasonId: string) {
  const passwordHash = await hashPassword(teamPassword);
  const payload = teams.map((team) => ({
    season_id: seasonId,
    team_id: team.team_id,
    team_name: team.team_name,
    password_hash: passwordHash,
    current_door: 1,
    solved: 0,
    wrong_count: 0,
    last_pass_time: null
  }));

  const { error } = await supabase
    .from("teams")
    .upsert(payload, { onConflict: "season_id,team_id" });

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertChallenges(seasonId: string) {
  const payload = challenges.map((challenge) => ({
    season_id: seasonId,
    door: challenge.door,
    title: challenge.title,
    mission: challenge.mission,
    difficulty: challenge.difficulty,
    module: challenge.module,
    is_boss: challenge.is_boss
  }));

  const { error } = await supabase
    .from("challenges")
    .upsert(payload, { onConflict: "season_id,door" });

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertAnswers(seasonId: string) {
  const answerRows = teams.flatMap((team) =>
    challenges.map((challenge) => {
      const key = `${team.team_id}-${randomBytes(6).toString("hex").toUpperCase()}`;
      return {
        season_id: seasonId,
        team_id: team.team_id,
        door: challenge.door,
        key,
        answer_hash: hashAnswerKey(key, env.answerHashSecret)
      };
    })
  );

  const { error } = await supabase.from("answers").upsert(
    answerRows.map((row) => ({
      season_id: row.season_id,
      team_id: row.team_id,
      door: row.door,
      answer_hash: row.answer_hash
    })),
    { onConflict: "season_id,team_id,door" }
  );

  if (error) {
    throw new Error(error.message);
  }

  return answerRows;
}

function writeOutput(seasonId: string, answerRows: Awaited<ReturnType<typeof upsertAnswers>>) {
  const lines = [
    "AI Quest Engine - khoa test local",
    `Tao luc: ${new Date().toISOString()}`,
    `Season: ${seasonName}`,
    `season_id: ${seasonId}`,
    "",
    "Dang nhap doi mau:",
    ...teams.map((team) => `- ${team.team_id} / ${teamPassword} (${team.team_name})`),
    "",
    "Khoa dap an mau de test:",
    "team_id,door,key",
    ...answerRows.map((row) => `${row.team_id},${row.door},${row.key}`),
    "",
    "Luu y: File nay chi de test local, da duoc dua vao .gitignore."
  ];

  writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(lines.join("\n"));
  console.log(`\nDa ghi khoa test vao: ${outputPath}`);
}

async function main() {
  if (!existsSync(resolve(process.cwd(), ".env.local"))) {
    console.warn("CANH BAO: Khong thay .env.local. Script van se thu doc bien moi truong tu shell/.env.");
  }

  await assertTablesExist();
  const season = await findOrCreateSeason();
  await upsertChallenges(season.id);
  await upsertTeams(season.id);
  const answerRows = await upsertAnswers(season.id);
  writeOutput(season.id, answerRows);

  console.log("\nSeed hoan tat. Chay tiep:");
  console.log("  pnpm test:flow");
  console.log("  pnpm dev");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
