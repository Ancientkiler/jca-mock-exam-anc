import { getDb } from "@/lib/db/client";

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();

  await Promise.all([
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("questions").createIndex({ contentHash: 1 }, { unique: true }),
    db.collection("questions").createIndex({ sectionId: 1, status: 1 }),
    db.collection("papers").createIndex({ createdAt: -1 }),
    db.collection("tests").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("attempts").createIndex({ userId: 1, submittedAt: -1 }),
    db.collection("attempts").createIndex({ testId: 1 }),
    db
      .collection("answers")
      .createIndex({ attemptId: 1, questionId: 1 }, { unique: true }),
    db.collection("answers").createIndex({ userId: 1, questionId: 1 }),
    db
      .collection("login_attempts")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
