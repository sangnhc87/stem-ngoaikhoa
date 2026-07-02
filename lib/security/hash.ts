import bcrypt from "bcryptjs";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const PASSWORD_COST = 12;

export function normalizeKey(value: string) {
  return value.normalize("NFC").trim();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_COST);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function hashAnswerKey(answer: string, secret: string) {
  const normalized = normalizeKey(answer);
  const digest = createHmac("sha256", secret).update(normalized).digest("hex");
  return `hmac-sha256:${digest}`;
}

export function hashIpAddress(ip: string | null, secret: string) {
  if (!ip) {
    return null;
  }

  return createHmac("sha256", secret).update(ip).digest("hex");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqualText(left: string, right: string) {
  const leftBuffer = createHash("sha256").update(left).digest();
  const rightBuffer = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftBuffer, rightBuffer);
}
