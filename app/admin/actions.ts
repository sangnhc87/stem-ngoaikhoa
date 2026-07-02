"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/lib/env";
import { processCsvImport, type ImportState } from "@/lib/csv-import";
import { safeEqualText, hashPassword } from "@/lib/security/hash";
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession
} from "@/lib/security/session";
import {
  challengeSchema,
  seasonSchema,
  statusSchema,
  teamSchema,
  uuidSchema
} from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminLoginState = {
  error?: string;
};

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin");
  }
}

function redirectToAdmin(seasonId?: string, notice?: string): never {
  const params = new URLSearchParams();
  if (seasonId) params.set("season_id", seasonId);
  if (notice) params.set("notice", notice);
  redirect(`/admin${params.size ? `?${params.toString()}` : ""}`);
}

export async function adminLoginAction(
  _previousState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = String(formData.get("password") ?? "");
  const { adminPassword } = getServerEnv();

  if (!password || !safeEqualText(password, adminPassword)) {
    return { error: "Mật khẩu quản trị không đúng." };
  }

  await setAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function createSeasonAction(formData: FormData) {
  await requireAdmin();
  const parsed = seasonSchema.safeParse({
    name: formData.get("name"),
    year: formData.get("year") || undefined,
    theme: formData.get("theme") || undefined
  });

  if (!parsed.success) {
    redirectToAdmin(undefined, "season-invalid");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("seasons")
    .insert({
      name: parsed.data.name,
      year: parsed.data.year ?? null,
      theme: parsed.data.theme || null
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirectToAdmin(data.id, "season-created");
}

export async function updateSeasonStatusAction(formData: FormData) {
  await requireAdmin();
  const seasonId = String(formData.get("season_id") ?? "");
  const parsedSeasonId = uuidSchema.safeParse(seasonId);
  const parsedStatus = statusSchema.safeParse(formData.get("status"));

  if (!parsedSeasonId.success || !parsedStatus.success) {
    redirectToAdmin(undefined, "status-invalid");
  }

  const status = parsedStatus.data;
  const timestampField =
    status === "OPEN"
      ? { start_time: new Date().toISOString() }
      : status === "CLOSED"
        ? { end_time: new Date().toISOString() }
        : {};

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("seasons")
    .update({
      status,
      ...timestampField
    })
    .eq("id", seasonId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirectToAdmin(seasonId, "status-updated");
}

export async function createTeamAction(formData: FormData) {
  await requireAdmin();
  const parsed = teamSchema.safeParse({
    season_id: formData.get("season_id"),
    team_id: formData.get("team_id"),
    team_name: formData.get("team_name"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirectToAdmin(String(formData.get("season_id") ?? ""), "team-invalid");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("teams").insert({
    season_id: parsed.data.season_id,
    team_id: parsed.data.team_id,
    team_name: parsed.data.team_name,
    password_hash: await hashPassword(parsed.data.password)
  });

  if (error) {
    redirectToAdmin(parsed.data.season_id, "team-duplicate");
  }

  revalidatePath("/admin");
  redirectToAdmin(parsed.data.season_id, "team-created");
}

export async function createChallengeAction(formData: FormData) {
  await requireAdmin();
  const parsed = challengeSchema.safeParse({
    season_id: formData.get("season_id"),
    door: formData.get("door"),
    title: formData.get("title"),
    mission: formData.get("mission"),
    file_url: formData.get("file_url"),
    difficulty: formData.get("difficulty") || 1,
    module: formData.get("module") || undefined,
    is_boss: formData.get("is_boss") || undefined
  });

  if (!parsed.success) {
    redirectToAdmin(String(formData.get("season_id") ?? ""), "challenge-invalid");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("challenges").insert({
    season_id: parsed.data.season_id,
    door: parsed.data.door,
    title: parsed.data.title,
    mission: parsed.data.mission,
    file_url: parsed.data.file_url || null,
    difficulty: parsed.data.difficulty,
    module: parsed.data.module || null,
    is_boss: parsed.data.is_boss
  });

  if (error) {
    redirectToAdmin(parsed.data.season_id, "challenge-duplicate");
  }

  revalidatePath("/admin");
  redirectToAdmin(parsed.data.season_id, "challenge-created");
}

export async function uploadChallengeFileAction(formData: FormData) {
  await requireAdmin();
  const seasonId = String(formData.get("season_id") ?? "");
  const challengeId = String(formData.get("challenge_id") ?? "");
  const door = String(formData.get("door") ?? "");
  const file = formData.get("file");
  const parsedIds = {
    seasonId: uuidSchema.safeParse(seasonId),
    challengeId: uuidSchema.safeParse(challengeId),
    door: Number.parseInt(door, 10)
  };

  if (
    !parsedIds.seasonId.success ||
    !parsedIds.challengeId.success ||
    !Number.isInteger(parsedIds.door) ||
    parsedIds.door < 1
  ) {
    redirectToAdmin(seasonId, "file-invalid");
  }

  if (!(file instanceof File) || file.size === 0) {
    redirectToAdmin(seasonId, "file-missing");
  }

  if (file.size > 25 * 1024 * 1024) {
    redirectToAdmin(seasonId, "file-too-large");
  }

  const env = getServerEnv();
  const supabase = getSupabaseAdmin();
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id")
    .eq("id", challengeId)
    .eq("season_id", seasonId)
    .eq("door", parsedIds.door)
    .maybeSingle();

  if (challengeError || !challenge) {
    redirectToAdmin(seasonId, "challenge-missing");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120);
  const path = `${seasonId}/door-${door}/${Date.now()}-${safeName}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(env.storageBucket)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(env.storageBucket).getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("challenges")
    .update({ file_url: publicUrl })
    .eq("id", challengeId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await supabase.from("files").insert({
    season_id: seasonId,
    door: Number(door),
    file_url: publicUrl,
    file_type: file.type || null
  });

  revalidatePath("/admin");
  redirectToAdmin(seasonId, "file-uploaded");
}

export async function resetSeasonAction(formData: FormData) {
  await requireAdmin();
  const seasonId = String(formData.get("season_id") ?? "");
  const parsedSeasonId = uuidSchema.safeParse(seasonId);

  if (!parsedSeasonId.success) {
    redirectToAdmin(undefined, "season-invalid");
  }

  const supabase = getSupabaseAdmin();

  const deleteResult = await supabase.from("submissions").delete().eq("season_id", seasonId);
  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  const teamsResult = await supabase
    .from("teams")
    .update({
      current_door: 1,
      solved: 0,
      wrong_count: 0,
      last_pass_time: null
    })
    .eq("season_id", seasonId);

  if (teamsResult.error) {
    throw new Error(teamsResult.error.message);
  }

  await supabase.from("seasons").update({ status: "DRAFT" }).eq("id", seasonId);

  revalidatePath("/admin");
  redirectToAdmin(seasonId, "season-reset");
}

export async function importCsvAction(
  _previousState: ImportState,
  formData: FormData
): Promise<ImportState> {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      message: "Phiên quản trị đã hết hạn."
    };
  }

  try {
    const state = await processCsvImport(formData);
    revalidatePath("/admin");
    return state;
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Không thể xử lý CSV."
    };
  }
}
