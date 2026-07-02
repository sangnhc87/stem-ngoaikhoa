"use server";

import { redirect } from "next/navigation";
import { authenticateTeam } from "@/lib/game";
import { clearTeamSession, setTeamSession } from "@/lib/security/session";
import { teamLoginSchema } from "@/lib/schemas";

export type LoginState = {
  error?: string;
};

export async function loginTeamAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = teamLoginSchema.safeParse({
    team_id: formData.get("team_id"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Thông tin đăng nhập chưa hợp lệ."
    };
  }

  const session = await authenticateTeam(parsed.data.team_id, parsed.data.password);

  if (!session) {
    return {
      error: "Mã đội hoặc mật khẩu không đúng."
    };
  }

  await setTeamSession(session.teamUuid, session.seasonId);
  redirect("/play");
}

export async function logoutTeamAction() {
  await clearTeamSession();
  redirect("/login");
}
