import { z } from "zod";

export const teamLoginSchema = z.object({
  team_id: z.string().trim().min(1, "Nhập mã đội.").max(80, "Mã đội quá dài."),
  password: z.string().min(1, "Nhập mật khẩu.").max(200, "Mật khẩu quá dài.")
});

export const keySubmitSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Nhập khóa của cửa hiện tại.")
    .max(200, "Khóa quá dài.")
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Nhập mật khẩu quản trị.")
});

export const seasonSchema = z.object({
  name: z.string().trim().min(2, "Tên mùa thi quá ngắn.").max(160, "Tên mùa thi quá dài."),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  theme: z.string().trim().max(200, "Chủ đề quá dài.").optional()
});

export const teamSchema = z.object({
  season_id: z.string().uuid(),
  team_id: z.string().trim().min(1).max(80),
  team_name: z.string().trim().min(1).max(160),
  password: z.string().min(4, "Mật khẩu cần ít nhất 4 ký tự.").max(200)
});

export const challengeSchema = z.object({
  season_id: z.string().uuid(),
  door: z.coerce.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  mission: z.string().trim().min(1).max(8000),
  file_url: z.string().trim().url().optional().or(z.literal("")),
  difficulty: z.coerce.number().int().min(1).max(10).default(1),
  module: z.string().trim().max(120).optional(),
  is_boss: z
    .union([z.literal("on"), z.literal("true"), z.literal("1"), z.literal(true)])
    .optional()
    .transform(Boolean)
});

export const statusSchema = z.enum(["DRAFT", "OPEN", "CLOSED"]);
export const uuidSchema = z.string().uuid();
