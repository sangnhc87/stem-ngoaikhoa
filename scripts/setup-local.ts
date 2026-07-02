import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";

const envExamplePath = resolve(process.cwd(), ".env.example");
const envLocalPath = resolve(process.cwd(), ".env.local");

const requiredVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "ADMIN_PASSWORD",
  "SESSION_SECRET",
  "ANSWER_HASH_SECRET",
  "IP_HASH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "ENABLE_EXPERIMENTAL_COREPACK"
];

const secretVariables = [
  "ADMIN_PASSWORD",
  "SESSION_SECRET",
  "ANSWER_HASH_SECRET",
  "IP_HASH_SECRET"
];

function printTitle(title: string) {
  console.log(`\n=== ${title} ===`);
}

function isPlaceholder(value: string) {
  return (
    value.includes("your-") ||
    value.includes("replace-with") ||
    value.includes("change-this") ||
    value.trim().length === 0
  );
}

function checkNodeVersion() {
  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

  if (major < 20) {
    throw new Error(`Node.js hien tai la ${process.version}. Can Node.js 20 tro len, khuyen nghi Node.js 22.`);
  }

  if (major < 22) {
    console.warn(`CANH BAO: Dang dung ${process.version}. Supabase khuyen nghi Node.js 22 cho cac ban moi.`);
  } else {
    console.log(`OK Node.js: ${process.version}`);
  }
}

function checkPnpm() {
  try {
    const version = execFileSync("pnpm", ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    console.log(`OK pnpm: ${version}`);
  } catch {
    throw new Error(
      "Khong tim thay pnpm. Hay chay: corepack enable && corepack prepare pnpm@10.12.1 --activate"
    );
  }
}

function ensureEnvLocal() {
  if (!existsSync(envExamplePath)) {
    throw new Error("Khong tim thay .env.example trong repo.");
  }

  if (!existsSync(envLocalPath)) {
    copyFileSync(envExamplePath, envLocalPath);
    console.log("Da tao .env.local tu .env.example.");
    console.log("Hay mo .env.local va dien Supabase URL, anon key, service_role key va cac secret.");
    process.exitCode = 1;
    return null;
  }

  console.log("OK .env.local da ton tai.");
  return parse(readFileSync(envLocalPath));
}

function validateEnv(env: Record<string, string>) {
  const errors: string[] = [];

  for (const key of requiredVariables) {
    const value = env[key];
    if (!value || isPlaceholder(value)) {
      errors.push(`${key} chua duoc dien dung.`);
    }
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL phai bat dau bang https://");
  }

  for (const key of secretVariables) {
    const value = env[key];
    if (value && value.length < 32) {
      console.warn(`CANH BAO: ${key} ngan hon 32 ky tu. Hay dung chuoi dai va ngau nhien hon.`);
    }
  }

  if (env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("ey")) {
    console.log("OK SUPABASE_SERVICE_ROLE_KEY co dang JWT.");
  } else if (env.SUPABASE_SERVICE_ROLE_KEY && !isPlaceholder(env.SUPABASE_SERVICE_ROLE_KEY)) {
    console.warn("CANH BAO: SUPABASE_SERVICE_ROLE_KEY khong giong dinh dang key Supabase thuong gap.");
  }

  if (errors.length > 0) {
    console.error("\nCan sua .env.local:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("OK cac bien moi truong bat buoc da duoc dien.");
}

function printNextCommands() {
  printTitle("Lenh tiep theo");
  console.log("1. Chay huong dan Supabase:");
  console.log("   pnpm setup:supabase");
  console.log("2. Sau khi da chay SQL migration trong Supabase:");
  console.log("   pnpm seed");
  console.log("3. Kiem tra luong database/game:");
  console.log("   pnpm test:flow");
  console.log("4. Chay website local:");
  console.log("   pnpm dev");
  console.log("5. Mo trinh duyet:");
  console.log("   http://localhost:3000/login");
}

function main() {
  printTitle("Kiem tra cai dat local AI Quest Engine");
  checkNodeVersion();
  checkPnpm();
  const env = ensureEnvLocal();

  if (env) {
    validateEnv(env);
  }

  printNextCommands();
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
