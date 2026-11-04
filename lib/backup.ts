import { randomUUID } from "node:crypto";
import { z } from "zod";
import { answers, attempts, tests } from "@/lib/db/collections";
import type { AnswerDoc, AttemptDoc, TestDoc } from "@/lib/db/types";

const dateString = z.string().datetime({ offset: true }).or(z.string().min(1));

const testSchema = z.object({
  title: z.string(),
  kind: z.enum(["full", "drill"]),
  pattern: z.unknown(),
  durationSec: z.number().int().positive(),
  questionIds: z.array(z.string()),
  isTemplate: z.boolean().optional(),
  createdAt: dateString,
});

const attemptSchema = z.object({
  testIndex: z.number().int().min(0),
  startedAt: dateString,
  endsAt: dateString,
  submittedAt: dateString.nullable(),
  status: z.enum(["in_progress", "submitted"]),
  score: z.unknown().nullable(),
  createdAt: dateString,
});

const answerSchema = z.object({
  attemptIndex: z.number().int().min(0),
  questionId: z.string(),
  selectedIndex: z.number().int().min(0).max(3).nullable(),
  isCorrect: z.boolean().nullable(),
  markedForReview: z.boolean().optional(),
  timeSpentMs: z.number().int().min(0).optional(),
  updatedAt: dateString,
});

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: dateString,
  tests: z.array(testSchema).max(500),
  attempts: z.array(attemptSchema).max(500),
  answers: z.array(answerSchema).max(20_000),
});

export type BackupPayload = z.infer<typeof backupSchema>;

export async function exportUserData(userId: string, username: string) {
  const [testDocs, attemptDocs, answerDocs] = await Promise.all([
    (await tests()).find({ userId }).sort({ createdAt: 1 }).toArray(),
    (await attempts()).find({ userId }).sort({ createdAt: 1 }).toArray(),
    (await answers()).find({ userId }).sort({ updatedAt: 1 }).toArray(),
  ]);

  const testIndex = new Map(testDocs.map((test, index) => [test._id, index]));
  const attemptIndex = new Map(
    attemptDocs.map((attempt, index) => [attempt._id, index]),
  );

  return {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    username,
    tests: testDocs.map((test) => ({
      title: test.title,
      kind: test.kind,
      pattern: test.pattern,
      durationSec: test.durationSec,
      questionIds: test.questionIds,
      isTemplate: test.isTemplate,
      createdAt: test.createdAt.toISOString(),
    })),
    attempts: attemptDocs.map((attempt) => ({
      testIndex: testIndex.get(attempt.testId) ?? 0,
      startedAt: attempt.startedAt.toISOString(),
      endsAt: attempt.endsAt.toISOString(),
      submittedAt: attempt.submittedAt?.toISOString() ?? null,
      status: attempt.status,
      score: attempt.score,
      createdAt: attempt.createdAt.toISOString(),
    })),
    answers: answerDocs
      .filter((answer) => attemptIndex.has(answer.attemptId))
      .map((answer) => ({
        attemptIndex: attemptIndex.get(answer.attemptId) ?? 0,
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect: answer.isCorrect,
        markedForReview: answer.markedForReview,
        timeSpentMs: answer.timeSpentMs,
        updatedAt: answer.updatedAt.toISOString(),
      })),
  };
}

export async function restoreUserData(
  userId: string,
  payload: BackupPayload,
): Promise<{ tests: number; attempts: number; answers: number }> {
  const testIds: string[] = [];
  const attemptIds: string[] = [];

  const testDocs: TestDoc[] = payload.tests.map((test) => {
    const id = randomUUID();
    testIds.push(id);
    return {
      _id: id,
      userId,
      title: test.title,
      kind: test.kind,
      pattern: test.pattern,
      durationSec: test.durationSec,
      questionIds: test.questionIds,
      isTemplate: test.isTemplate ?? false,
      createdAt: new Date(test.createdAt),
    };
  });

  const attemptDocs: AttemptDoc[] = payload.attempts.map((attempt) => {
    const id = randomUUID();
    attemptIds.push(id);
    return {
      _id: id,
      userId,
      testId: testIds[attempt.testIndex] ?? testIds[0] ?? "",
      startedAt: new Date(attempt.startedAt),
      endsAt: new Date(attempt.endsAt),
      submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt) : null,
      status: attempt.status,
      score: (attempt.score as AttemptDoc["score"]) ?? null,
      createdAt: new Date(attempt.createdAt),
    };
  });

  const answerDocs: AnswerDoc[] = payload.answers
    .map((answer): AnswerDoc | null => {
      const attemptId = attemptIds[answer.attemptIndex];
      if (!attemptId) return null;
      return {
        _id: randomUUID(),
        attemptId,
        userId,
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect: answer.isCorrect,
        markedForReview: answer.markedForReview ?? false,
        timeSpentMs: answer.timeSpentMs ?? 0,
        updatedAt: new Date(answer.updatedAt),
      };
    })
    .filter((answer): answer is AnswerDoc => Boolean(answer));

  if (testDocs.length > 0) await (await tests()).insertMany(testDocs);
  if (attemptDocs.length > 0) await (await attempts()).insertMany(attemptDocs);
  if (answerDocs.length > 0) await (await answers()).insertMany(answerDocs);

  return {
    tests: testDocs.length,
    attempts: attemptDocs.length,
    answers: answerDocs.length,
  };
}

export async function resetUserData(userId: string): Promise<void> {
  await Promise.all([
    (await answers()).deleteMany({ userId }),
    (await attempts()).deleteMany({ userId }),
    (await tests()).deleteMany({ userId }),
  ]);
}
