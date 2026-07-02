import { DisplayClient } from "@/app/display/display-client";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function DisplayPage() {
  const data = await getLeaderboard(15);
  return <DisplayClient initialData={data} />;
}
