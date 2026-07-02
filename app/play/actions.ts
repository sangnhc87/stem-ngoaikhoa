"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTeamSession } from "@/lib/security/session";
import { keySubmitSchema } from "@/lib/schemas";
import { submitKeyAttempt } from "@/lib/game";

export type SubmitKeyState = {
  result?: "correct" | "wrong" | "closed" | "invalid" | "rate_limited";
  message?: string;
};

const messageByResult: Record<NonNullable<SubmitKeyState["result"]>, string> = {
  correct: "Chính xác. Cửa tiếp theo đã được mở.",
  wrong: "Khóa chưa đúng. Hãy kiểm tra lại manh mối.",
  closed: "Cuộc thi chưa mở hoặc đã đóng.",
  invalid: "Lượt nộp không hợp lệ cho cửa hiện tại.",
  rate_limited: "Vui lòng chờ ít nhất 3 giây trước khi nộp tiếp."
};

export async function submitKeyAction(
  _previousState: SubmitKeyState,
  formData: FormData
): Promise<SubmitKeyState> {
  const session = await getTeamSession();

  if (!session) {
    redirect("/login");
  }

  const parsed = keySubmitSchema.safeParse({
    key: formData.get("key")
  });

  if (!parsed.success) {
    return {
      result: "invalid",
      message: parsed.error.issues[0]?.message ?? "Khóa chưa hợp lệ."
    };
  }

  const result = await submitKeyAttempt(session.teamUuid, session.seasonId, parsed.data.key);
  revalidatePath("/play");
  revalidatePath("/leaderboard");
  revalidatePath("/display");

  return {
    result: result.result,
    message: result.message || messageByResult[result.result]
  };
}
