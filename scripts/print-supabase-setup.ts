import { existsSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = "supabase/migrations/20260702000000_initial_schema.sql";
const absoluteMigrationPath = resolve(process.cwd(), migrationPath);

function main() {
  console.log("\n=== Cai dat Supabase cho AI Quest Engine ===\n");

  if (!existsSync(absoluteMigrationPath)) {
    console.error(`KHONG TIM THAY migration: ${migrationPath}`);
    process.exit(1);
  }

  console.log("File SQL can copy vao Supabase SQL Editor:");
  console.log(`  ${migrationPath}`);
  console.log(`  ${absoluteMigrationPath}`);

  console.log("\nCac buoc thuc hien:");
  console.log("1. Mo https://supabase.com va vao project cua thay/co.");
  console.log("2. Vao SQL Editor.");
  console.log("3. Bam New Query.");
  console.log(`4. Mo file ${migrationPath} trong repo nay.`);
  console.log("5. Copy toan bo noi dung file SQL.");
  console.log("6. Dan vao Supabase SQL Editor.");
  console.log("7. Bam Run.");
  console.log("8. Neu thanh cong, Supabase se co cac bang:");
  console.log("   seasons, teams, challenges, answers, submissions, files");
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
