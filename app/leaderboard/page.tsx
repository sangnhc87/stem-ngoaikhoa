import Link from "next/link";
import { Home } from "lucide-react";
import { LeaderboardClient } from "@/app/leaderboard/leaderboard-client";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const data = await getLeaderboard();

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-4 flex justify-end">
          <Link
            href="/login"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
          >
            <Home size={17} aria-hidden="true" />
            Về đăng nhập
          </Link>
        </nav>
        <LeaderboardClient initialData={data} />
      </div>
    </main>
  );
}
