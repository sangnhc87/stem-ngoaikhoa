import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ProductSubmission, Season } from "@/lib/types";

export type ProductGalleryData = {
  season: Season | null;
  products: ProductSubmission[];
};

export async function upsertProductSubmission(input: {
  seasonId: string;
  teamId: string;
  door: number;
  title: string;
  productUrl?: string;
  description: string;
  prompt?: string;
  verification?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("product_submissions").upsert(
    {
      season_id: input.seasonId,
      team_id: input.teamId,
      door: input.door,
      title: input.title,
      product_url: input.productUrl || null,
      description: input.description,
      prompt: input.prompt || null,
      verification: input.verification || null,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "season_id,team_id,door"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getProductGallery(seasonId?: string): Promise<ProductGalleryData> {
  const supabase = getSupabaseAdmin();
  const { data: seasonsData, error: seasonsError } = await supabase
    .from("seasons")
    .select("*")
    .order("created_at", { ascending: false });

  if (seasonsError) {
    throw new Error(seasonsError.message);
  }

  const seasons = (seasonsData ?? []) as Season[];
  const season =
    (seasonId ? seasons.find((item) => item.id === seasonId) : null) ??
    seasons.find((item) => item.status === "OPEN") ??
    seasons[0] ??
    null;

  if (!season) {
    return {
      season: null,
      products: []
    };
  }

  const { data, error } = await supabase
    .from("product_submissions")
    .select("*, teams(team_name)")
    .eq("season_id", season.id)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  const products = (data ?? []).map((row) => {
    const team = Array.isArray(row.teams) ? row.teams[0] : row.teams;
    return {
      ...row,
      team_name: team?.team_name ?? null
    };
  }) as ProductSubmission[];

  return {
    season,
    products
  };
}
