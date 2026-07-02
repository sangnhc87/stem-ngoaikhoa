import { NextRequest, NextResponse } from "next/server";
import { getActiveAnnouncements } from "@/lib/announcements";
import { getCurrentSeason } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

// GET /api/announcements?season_id=UUID
export async function GET(request: NextRequest) {
  const seasonId = request.nextUrl.searchParams.get("season_id");

  let resolvedSeasonId = seasonId;
  if (!resolvedSeasonId) {
    // Tự động lấy mùa thi hiện tại nếu không có season_id
    const season = await getCurrentSeason();
    resolvedSeasonId = season?.id ?? null;
  }

  if (!resolvedSeasonId) {
    return NextResponse.json({ announcements: [] });
  }

  const announcements = await getActiveAnnouncements(resolvedSeasonId);
  return NextResponse.json({ announcements });
}
