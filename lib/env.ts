import "server-only";

function readRequired(name: string) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getServerEnv() {
  const sessionSecret = readRequired("SESSION_SECRET");
  const answerHashSecret = readRequired("ANSWER_HASH_SECRET");

  if (sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  if (answerHashSecret.length < 32) {
    throw new Error("ANSWER_HASH_SECRET must be at least 32 characters.");
  }

  return {
    supabaseUrl: readRequired("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequired("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: readRequired("SUPABASE_SERVICE_ROLE_KEY"),
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || "challenge-files",
    adminPassword: readRequired("ADMIN_PASSWORD"),
    sessionSecret,
    answerHashSecret,
    ipHashSecret: process.env.IP_HASH_SECRET || sessionSecret
  };
}
