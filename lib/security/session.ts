import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";

const TEAM_COOKIE = "aqe_team";
const ADMIN_COOKIE = "aqe_admin";
const TEAM_MAX_AGE = 60 * 60 * 8;
const ADMIN_MAX_AGE = 60 * 60 * 8;

export type TeamSession = {
  kind: "team";
  teamUuid: string;
  seasonId: string;
  exp: number;
};

export type AdminSession = {
  kind: "admin";
  exp: number;
};

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payload: object) {
  const { sessionSecret } = getServerEnv();
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", sessionSecret)
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function verifyToken<T extends { exp: number; kind: string }>(
  token: string | undefined,
  expectedKind: T["kind"]
): T | null {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const { sessionSecret } = getServerEnv();
  const expected = createHmac("sha256", sessionSecret)
    .update(body)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    const now = Math.floor(Date.now() / 1000);

    if (parsed.kind !== expectedKind || parsed.exp < now) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

export async function setTeamSession(teamUuid: string, seasonId: string) {
  const exp = Math.floor(Date.now() / 1000) + TEAM_MAX_AGE;
  const token = signPayload({ kind: "team", teamUuid, seasonId, exp });
  const cookieStore = await cookies();
  cookieStore.set(TEAM_COOKIE, token, cookieOptions(TEAM_MAX_AGE));
}

export async function getTeamSession() {
  const cookieStore = await cookies();
  return verifyToken<TeamSession>(cookieStore.get(TEAM_COOKIE)?.value, "team");
}

export async function clearTeamSession() {
  const cookieStore = await cookies();
  cookieStore.delete(TEAM_COOKIE);
}

export async function setAdminSession() {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_MAX_AGE;
  const token = signPayload({ kind: "admin", exp });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, cookieOptions(ADMIN_MAX_AGE));
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyToken<AdminSession>(cookieStore.get(ADMIN_COOKIE)?.value, "admin");
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
