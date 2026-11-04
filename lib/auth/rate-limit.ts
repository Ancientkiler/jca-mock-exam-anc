import { loginAttempts } from "@/lib/db/collections";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function isLoginBlocked(key: string): Promise<boolean> {
  const record = await (await loginAttempts()).findOne({ _id: key });
  if (!record) return false;
  if (record.expiresAt.getTime() <= Date.now()) return false;
  return record.count >= MAX_ATTEMPTS;
}

export async function recordLoginFailure(key: string): Promise<void> {
  const now = new Date();
  await (await loginAttempts()).updateOne(
    { _id: key },
    {
      $inc: { count: 1 },
      $set: { lastAt: now, expiresAt: new Date(now.getTime() + WINDOW_MS) },
      $setOnInsert: { firstAt: now },
    },
    { upsert: true },
  );
}

export async function clearLoginFailures(key: string): Promise<void> {
  await (await loginAttempts()).deleteOne({ _id: key });
}
