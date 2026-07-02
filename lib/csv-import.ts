import "server-only";

import { parse } from "csv-parse/sync";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { hashAnswerKey, hashPassword } from "@/lib/security/hash";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ImportType = "teams" | "challenges" | "answers";

export type ImportState = {
  ok?: boolean;
  message?: string;
  errors?: string[];
  rows?: Record<string, string | number | boolean | null>[];
  totalRows?: number;
};

type ImportRow = Record<string, string | number | boolean | null>;

const MAX_CSV_BYTES = 2 * 1024 * 1024;
const MAX_CSV_ROWS = 2000;
const importTypes = new Set(["teams", "challenges", "answers"]);

const requiredColumns: Record<ImportType, string[]> = {
  teams: ["season_id", "team_id", "team_name", "password"],
  challenges: [
    "season_id",
    "door",
    "title",
    "mission",
    "file_url",
    "difficulty",
    "module",
    "is_boss"
  ],
  answers: ["season_id", "team_id", "door", "key"]
};

const teamRowSchema = z.object({
  season_id: z.string().uuid(),
  team_id: z.string().trim().min(1).max(80),
  team_name: z.string().trim().min(1).max(160),
  password: z.string().min(4).max(200)
});

const challengeRowSchema = z.object({
  season_id: z.string().uuid(),
  door: z.coerce.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  mission: z.string().trim().min(1).max(8000),
  file_url: z.union([z.string().trim().url(), z.literal("")]).optional().default(""),
  difficulty: z.coerce.number().int().min(1).max(10).default(1),
  module: z.string().trim().max(120).optional().default(""),
  is_boss: z.preprocess((value) => parseBoolean(String(value ?? "")), z.boolean())
});

const answerRowSchema = z.object({
  season_id: z.string().uuid(),
  team_id: z.string().trim().min(1).max(80),
  door: z.coerce.number().int().positive(),
  key: z.string().trim().min(1).max(200)
});

function parseBoolean(value: string) {
  return ["true", "1", "yes", "y", "co", "có", "boss"].includes(value.trim().toLowerCase());
}

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.trim(), typeof value === "string" ? value.trim() : value])
  );
}

async function parseCsvFile(file: File, type: ImportType) {
  if (file.size > MAX_CSV_BYTES) {
    throw new Error("Tệp CSV quá lớn. Giới hạn hiện tại là 2MB.");
  }

  const text = await file.text();
  const rows = parse(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  const headerLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const headers = headerLine.split(",").map((column) => column.trim().replace(/^\uFEFF/, ""));
  const missingColumns = requiredColumns[type].filter((column) => !headers.includes(column));

  if (rows.length > MAX_CSV_ROWS) {
    throw new Error(`CSV có quá nhiều dòng. Giới hạn hiện tại là ${MAX_CSV_ROWS} dòng.`);
  }

  return {
    rows: rows.map(normalizeRow),
    missingColumns
  };
}

function validateRows(type: ImportType, rows: Record<string, unknown>[]) {
  const errors: string[] = [];
  const parsedRows: ImportRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const result =
      type === "teams"
        ? teamRowSchema.safeParse(row)
        : type === "challenges"
          ? challengeRowSchema.safeParse(row)
          : answerRowSchema.safeParse(row);

    if (!result.success) {
      errors.push(
        `Dòng ${rowNumber}: ${result.error.issues.map((issue) => issue.message).join("; ")}`
      );
      return;
    }

    parsedRows.push(result.data);
  });

  return {
    errors,
    rows: parsedRows
  };
}

function rowKey(row: ImportRow, type: ImportType) {
  return type === "teams"
    ? `${row.season_id}:${row.team_id}`
    : type === "challenges"
      ? `${row.season_id}:${row.door}`
      : `${row.season_id}:${row.team_id}:${row.door}`;
}

function findDuplicates(rows: ImportRow[], type: ImportType) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    const key = rowKey(row, type);

    if (seen.has(key)) {
      duplicates.add(key);
    }
    seen.add(key);
  }

  return [...duplicates];
}

async function findExistingDuplicates(rows: ImportRow[], type: ImportType) {
  const supabase = getSupabaseAdmin();
  const existing: string[] = [];

  for (const row of rows) {
    if (type === "teams") {
      const { data } = await supabase
        .from("teams")
        .select("id")
        .eq("season_id", row.season_id)
        .eq("team_id", row.team_id)
        .maybeSingle();
      if (data) existing.push(`${row.season_id}:${row.team_id}`);
    }

    if (type === "challenges") {
      const { data } = await supabase
        .from("challenges")
        .select("id")
        .eq("season_id", row.season_id)
        .eq("door", row.door)
        .maybeSingle();
      if (data) existing.push(`${row.season_id}:${row.door}`);
    }

    if (type === "answers") {
      const { data } = await supabase
        .from("answers")
        .select("id")
        .eq("season_id", row.season_id)
        .eq("team_id", row.team_id)
        .eq("door", row.door)
        .maybeSingle();
      if (data) existing.push(`${row.season_id}:${row.team_id}:${row.door}`);
    }
  }

  return existing;
}

async function validateReferences(rows: ImportRow[], type: ImportType) {
  if (rows.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const errors: string[] = [];
  const seasonIds = [...new Set(rows.map((row) => String(row.season_id)))];
  const { data: seasonRows, error: seasonError } = await supabase
    .from("seasons")
    .select("id")
    .in("id", seasonIds);

  if (seasonError) {
    throw new Error(seasonError.message);
  }

  const existingSeasons = new Set((seasonRows ?? []).map((row) => row.id));
  const missingSeasons = seasonIds.filter((seasonId) => !existingSeasons.has(seasonId));

  if (missingSeasons.length > 0) {
    errors.push(`Không tìm thấy season_id: ${missingSeasons.slice(0, 5).join(", ")}.`);
  }

  if (type !== "answers") {
    return errors;
  }

  const { data: teamRows, error: teamError } = await supabase
    .from("teams")
    .select("season_id, team_id")
    .in("season_id", seasonIds);

  if (teamError) {
    throw new Error(teamError.message);
  }

  const { data: challengeRows, error: challengeError } = await supabase
    .from("challenges")
    .select("season_id, door")
    .in("season_id", seasonIds);

  if (challengeError) {
    throw new Error(challengeError.message);
  }

  const existingTeams = new Set(
    (teamRows ?? []).map((row) => `${row.season_id}:${row.team_id}`)
  );
  const existingChallenges = new Set(
    (challengeRows ?? []).map((row) => `${row.season_id}:${row.door}`)
  );
  const missingTeams = new Set<string>();
  const missingChallenges = new Set<string>();

  for (const row of rows) {
    const teamKey = `${row.season_id}:${row.team_id}`;
    const challengeKey = `${row.season_id}:${row.door}`;

    if (!existingTeams.has(teamKey)) {
      missingTeams.add(teamKey);
    }
    if (!existingChallenges.has(challengeKey)) {
      missingChallenges.add(challengeKey);
    }
  }

  if (missingTeams.size > 0) {
    errors.push(`Đáp án tham chiếu đội chưa tồn tại: ${[...missingTeams].slice(0, 5).join(", ")}.`);
  }

  if (missingChallenges.size > 0) {
    errors.push(
      `Đáp án tham chiếu cửa chưa tồn tại: ${[...missingChallenges].slice(0, 5).join(", ")}.`
    );
  }

  return errors;
}

function sanitizePreviewRows(type: ImportType, rows: ImportRow[]) {
  return rows.slice(0, 10).map((row) => {
    if (type === "teams") {
      return {
        ...row,
        password: "Đã ẩn"
      };
    }

    if (type === "answers") {
      return {
        season_id: row.season_id,
        team_id: row.team_id,
        door: row.door,
        key: "Đã ẩn"
      };
    }

    return row;
  });
}

async function insertRows(type: ImportType, rows: ImportRow[]) {
  const supabase = getSupabaseAdmin();

  if (type === "teams") {
    const payload = await Promise.all(
      rows.map(async (row) => ({
        season_id: row.season_id,
        team_id: row.team_id,
        team_name: row.team_name,
        password_hash: await hashPassword(String(row.password))
      }))
    );

    const { error } = await supabase.from("teams").insert(payload);
    if (error) throw new Error(error.message);
  }

  if (type === "challenges") {
    const payload = rows.map((row) => ({
      season_id: row.season_id,
      door: row.door,
      title: row.title,
      mission: row.mission,
      file_url: row.file_url || null,
      difficulty: row.difficulty,
      module: row.module || null,
      is_boss: row.is_boss
    }));

    const { error } = await supabase.from("challenges").insert(payload);
    if (error) throw new Error(error.message);
  }

  if (type === "answers") {
    const { answerHashSecret } = getServerEnv();
    const payload = rows.map((row) => ({
      season_id: row.season_id,
      team_id: row.team_id,
      door: row.door,
      answer_hash: hashAnswerKey(String(row.key), answerHashSecret)
    }));

    const { error } = await supabase.from("answers").insert(payload);
    if (error) throw new Error(error.message);
  }
}

export async function processCsvImport(formData: FormData): Promise<ImportState> {
  const mode = formData.get("mode") === "import" ? "import" : "preview";
  const typeValue = String(formData.get("type") ?? "");
  const file = formData.get("file");

  if (!importTypes.has(typeValue)) {
    return { ok: false, message: "Loại import không hợp lệ." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Chọn tệp CSV trước khi tiếp tục." };
  }

  const type = typeValue as ImportType;
  const { rows: rawRows, missingColumns } = await parseCsvFile(file, type);

  if (missingColumns.length > 0) {
    return {
      ok: false,
      message: "CSV thiếu cột bắt buộc.",
      errors: missingColumns.map((column) => `Thiếu cột ${column}.`)
    };
  }

  const { rows, errors } = validateRows(type, rawRows);
  const fileDuplicates = findDuplicates(rows, type);

  if (fileDuplicates.length > 0) {
    errors.push(`CSV có khóa trùng: ${fileDuplicates.slice(0, 5).join(", ")}.`);
  }

  const existingDuplicates = rows.length ? await findExistingDuplicates(rows, type) : [];
  const referenceErrors = await validateReferences(rows, type);

  if (existingDuplicates.length > 0) {
    errors.push(`Dữ liệu đã tồn tại: ${existingDuplicates.slice(0, 5).join(", ")}.`);
  }

  errors.push(...referenceErrors);

  if (errors.length > 0 || mode === "preview") {
    return {
      ok: errors.length === 0,
      message:
        errors.length === 0
          ? `Xem trước ${rows.length} dòng hợp lệ.`
          : `Có ${errors.length} lỗi cần sửa trước khi import.`,
      errors,
      rows: sanitizePreviewRows(type, rows),
      totalRows: rows.length
    };
  }

  await insertRows(type, rows);

  return {
    ok: true,
    message: `Đã import ${rows.length} dòng.`,
    rows: sanitizePreviewRows(type, rows),
    totalRows: rows.length
  };
}
