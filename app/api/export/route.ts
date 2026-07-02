import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/security/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Season, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/export?season_id=UUID — xuất kết quả CSV
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return new Response("Truy cập bị từ chối.", { status: 401 });
  }

  const seasonId = request.nextUrl.searchParams.get("season_id");
  if (!seasonId) {
    return new Response("Thiếu season_id.", { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const [seasonResult, teamsResult] = await Promise.all([
    supabase.from("seasons").select("*").eq("id", seasonId).single<Season>(),
    supabase
      .from("teams")
      .select(
        "team_id, team_name, solved, current_door, wrong_count, last_pass_time, created_at"
      )
      .eq("season_id", seasonId)
      .order("solved", { ascending: false })
      .order("last_pass_time", { ascending: true, nullsFirst: false })
      .order("wrong_count", { ascending: true })
      .order("team_name", { ascending: true })
  ]);

  if (seasonResult.error || !seasonResult.data) {
    return new Response("Không tìm thấy mùa thi.", { status: 404 });
  }

  const season = seasonResult.data;
  const teams = (teamsResult.data ?? []) as Pick<
    Team,
    "team_id" | "team_name" | "solved" | "current_door" | "wrong_count" | "last_pass_time" | "created_at"
  >[];

  // Tạo CSV
  const rows: string[] = [
    "Hạng,Mã lớp,Tên đội,Số cửa đã giải,Cửa hiện tại,Số lần sai,Thời gian mở cửa cuối"
  ];

  teams.forEach((team, index) => {
    const lastTime = team.last_pass_time
      ? new Date(team.last_pass_time).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      : "—";
    const row = [
      index + 1,
      escapeCSV(team.team_id),
      escapeCSV(team.team_name),
      team.solved,
      team.current_door,
      team.wrong_count,
      escapeCSV(lastTime)
    ].join(",");
    rows.push(row);
  });

  const csvContent = "\uFEFF" + rows.join("\r\n"); // BOM for Excel UTF-8
  const safeName = season.name.replace(/[^a-zA-Z0-9À-ỹ\s]/g, "").trim().replace(/\s+/g, "-");
  const filename = `ket-qua-${safeName}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
