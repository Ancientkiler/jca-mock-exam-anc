const DB_FALLBACK = "jca-mock-exam";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function mongoUri(): string {
  return required("MONGODB_URI");
}

export function databaseName(): string {
  return process.env.MONGODB_DB || DB_FALLBACK;
}

export function authSecret(): string {
  const secret = required("AUTH_SECRET");
  if (secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return secret;
}

export function adminUsername(): string {
  return process.env.ADMIN_USERNAME || "admin";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function cookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return isProduction();
}
