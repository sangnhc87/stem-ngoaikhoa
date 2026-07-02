import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const migrationsDir = "supabase/migrations";
const absoluteMigrationsDir = resolve(process.cwd(), migrationsDir);

function getMigrationPaths() {
  if (!existsSync(absoluteMigrationsDir)) {
    console.error(`KHONG TIM THAY thu muc migration: ${migrationsDir}`);
    process.exit(1);
  }

  return readdirSync(absoluteMigrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => `${migrationsDir}/${file}`);
}

function main() {
  console.log("\n=== Cai dat Supabase cho AI Quest Engine ===\n");

  const migrationPaths = getMigrationPaths();

  if (migrationPaths.length === 0) {
    console.error(`KHONG CO file SQL nao trong ${migrationsDir}`);
    process.exit(1);
  }

  console.log("Cac file SQL can copy vao Supabase SQL Editor theo dung thu tu:");
  for (const migrationPath of migrationPaths) {
    console.log(`  - ${migrationPath}`);
    console.log(`    ${resolve(process.cwd(), migrationPath)}`);
  }

  console.log("\nCac buoc thuc hien:");
  console.log("1. Mo https://supabase.com va vao project cua thay/co.");
  console.log("2. Vao SQL Editor.");
  console.log("3. Bam New Query.");
  console.log("4. Mo tung file SQL trong danh sach tren, theo dung thu tu ten file.");
  console.log("5. Copy toan bo noi dung file SQL.");
  console.log("6. Dan vao Supabase SQL Editor.");
  console.log("7. Bam Run. Lap lai cho den het cac file migration.");
  console.log("8. Neu thanh cong, Supabase se co cac bang:");
  console.log("   seasons, teams, challenges, answers, submissions, files, announcements");
  console.log("9. Bucket Storage mac dinh se la: challenge-files");

  console.log("\nSau khi chay SQL:");
  console.log("1. Vao Project Settings > API.");
  console.log("2. Copy Project URL vao NEXT_PUBLIC_SUPABASE_URL.");
  console.log("3. Copy anon public key vao NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  console.log("4. Copy service_role key vao SUPABASE_SERVICE_ROLE_KEY.");

  console.log("\nCANH BAO BAO MAT:");
  console.log("- SUPABASE_SERVICE_ROLE_KEY la khoa quan tri rat manh.");
  console.log("- Khong gui khoa nay cho hoc sinh.");
  console.log("- Khong dua khoa nay vao frontend.");
  console.log("- Khong dat khoa nay voi ten bat dau bang NEXT_PUBLIC_.");

  console.log("\nLenh tiep theo sau khi dien .env.local:");
  console.log("  pnpm seed");
  console.log("  pnpm test:flow");
  console.log("  pnpm dev");
}

main();
