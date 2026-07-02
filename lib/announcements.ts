import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type Announcement = {
  id: string;
  season_id: string;
  message: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export async function getActiveAnnouncements(seasonId: string): Promise<Announcement[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("season_id", seasonId)
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return [];
  return (data ?? []) as Announcement[];
}

export async function createAnnouncement(
  seasonId: string,
  message: string,
  expiresInMinutes?: number
) {
  const supabase = getSupabaseAdmin();
  const expiresAt = expiresInMinutes
    ? new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase.from("announcements").insert({
    season_id: seasonId,
    message,
    expires_at: expiresAt
  });

  return { error };
}

export async function deactivateAnnouncement(id: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from("announcements").update({ is_active: false }).eq("id", id);
}
