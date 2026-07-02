"use server";

import { redirect } from "next/navigation";
import { authenticateTeam, clearActiveTeamSession } from "@/lib/game";
import { clearTeamSession, getTeamSession, setTeamSession } from "@/lib/security/session";
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

  if ("error" in session && session.error === "active_elsewhere") {
    return {
      error: "Đội này đang đăng nhập ở thiết bị khác. Hãy bấm Thoát ở thiết bị cũ hoặc báo giáo viên mở khóa."
    };
  }

  await setTeamSession(session.teamUuid, session.seasonId, session.sessionToken);
  redirect("/play");
}

export async function logoutTeamAction() {
  const session = await getTeamSession();
  if (session) {
    await clearActiveTeamSession(session.teamUuid, session.seasonId, session.sessionToken);
  }
  await clearTeamSession();
  redirect("/login");
}
