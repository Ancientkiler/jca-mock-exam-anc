import { answers, attempts, questions, tests } from "@/lib/db/collections";
import type { AttemptDoc, QuestionDoc } from "@/lib/db/types";
import { sectionName } from "@/lib/exam/pattern";

export interface AttemptSummary {
  id: string;
  title: string;
  kind: string;
  status: "in_progress" | "submitted";
  startedAt: Date;
  endsAt: Date;
  submittedAt: Date | null;
  score: number;
  percent: number;
  correct: number;
  wrong: number;
  skipped: number;
}

export async function listAttempts(
  userId: string,
  limit = 100,
): Promise<AttemptSummary[]> {
  const docs = await (await attempts())
    .find({ userId })
    .sort({ startedAt: -1 })
    .limit(limit)
    .toArray();
  return hydrate(docs);
}

async function hydrate(docs: AttemptDoc[]): Promise<AttemptSummary[]> {
  if (docs.length === 0) return [];
  const testDocs = await (await tests())
    .find({ _id: { $in: docs.map((doc) => doc.testId) } })
    .toArray();
  const testMap = new Map(testDocs.map((test) => [test._id, test]));

  return docs.map((attempt) => {
    const test = testMap.get(attempt.testId);
    return {
      id: attempt._id,
      title: test?.title ?? "Attempt",
      kind: test?.kind ?? "full",
      status: attempt.status,
      startedAt: attempt.startedAt,
      endsAt: attempt.endsAt,
      submittedAt: attempt.submittedAt,
      score: attempt.score?.total ?? 0,
      percent: attempt.score?.percent ?? 0,
      correct: attempt.score?.correct ?? 0,
      wrong: attempt.score?.wrong ?? 0,
      skipped: attempt.score?.skipped ?? 0,
    };
  });
}

export interface DashboardData {
  submitted: number;
  inProgress: number;
  averagePercent: number;
  bestPercent: number;
  studyMinutes: number;
  totalQuestions: number;
  recent: AttemptSummary[];
  sections: { section: string; accuracy: number; total: number }[];
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const [attemptDocs, totalQuestions, timeRows] = await Promise.all([
    (await attempts()).find({ userId }).sort({ startedAt: -1 }).toArray(),
    (await questions()).countDocuments({ status: "published" }),
    (await answers())
      .aggregate<{ _id: null; total: number }>([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$timeSpentMs" } } },
      ])
      .toArray(),
  ]);

  const submittedDocs = attemptDocs.filter((doc) => doc.status === "submitted");
  const averagePercent =
    submittedDocs.length > 0
      ? submittedDocs.reduce((sum, doc) => sum + (doc.score?.percent ?? 0), 0) /
        submittedDocs.length
      : 0;
  const bestPercent =
    submittedDocs.length > 0
      ? Math.max(...submittedDocs.map((doc) => doc.score?.percent ?? 0))
      : 0;

  const sectionTotals = new Map<string, { correct: number; total: number }>();
  for (const doc of submittedDocs) {
    for (const section of doc.score?.sections ?? []) {
      const current = sectionTotals.get(section.sectionId) ?? { correct: 0, total: 0 };
      current.correct += section.correct;
      current.total += section.correct + section.wrong;
      sectionTotals.set(section.sectionId, current);
    }
  }

  return {
    submitted: submittedDocs.length,
    inProgress: attemptDocs.length - submittedDocs.length,
    averagePercent: round(averagePercent),
    bestPercent: round(bestPercent),
    studyMinutes: Math.round((timeRows[0]?.total ?? 0) / 60000),
    totalQuestions,
    recent: await hydrate(attemptDocs.slice(0, 5)),
    sections: Array.from(sectionTotals.entries())
      .map(([sectionId, value]) => ({
        section: sectionName(sectionId),
        accuracy:
          value.total > 0 ? round((value.correct / value.total) * 100) : 0,
        total: value.total,
      }))
      .sort((a, b) => a.section.localeCompare(b.section)),
  };
}

export async function getSectionCounts(): Promise<Record<string, number>> {
  const rows = await (await questions())
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: "published" } },
      { $group: { _id: "$sectionId", count: { $sum: 1 } } },
    ])
    .toArray();

  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

export interface MistakeItem {
  questionId: string;
  section: string;
  topic: string;
  stem: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number | null;
  explanation: string;
  lastAttemptAt: Date;
}

export async function listMistakes(userId: string): Promise<MistakeItem[]> {
  const rows = await (await answers())
    .aggregate<{ _id: string; selectedIndex: number | null; lastAt: Date }>([
      { $match: { userId, isCorrect: false } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$questionId",
          selectedIndex: { $first: "$selectedIndex" },
          lastAt: { $first: "$updatedAt" },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 100 },
    ])
    .toArray();

  if (rows.length === 0) return [];
  const docs = await (await questions())
    .find({ _id: { $in: rows.map((row) => row._id) } })
    .toArray();
  const map = new Map(docs.map((doc) => [doc._id, doc]));

  return rows
    .map((row) => {
      const question = map.get(row._id);
      if (!question) return null;
      return toMistake(question, row.selectedIndex, row.lastAt);
    })
    .filter((item): item is MistakeItem => Boolean(item));
}

function toMistake(
  question: QuestionDoc,
  selectedIndex: number | null,
  lastAt: Date,
): MistakeItem {
  return {
    questionId: question._id,
    section: sectionName(question.sectionId),
    topic: question.topic,
    stem: question.stem,
    options: question.options,
    selectedIndex,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    lastAttemptAt: lastAt,
  };
}

export interface BankFilters {
  section?: string;
  topic?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export interface BankResult {
  items: QuestionDoc[];
  total: number;
  page: number;
  pageSize: number;
  topics: string[];
}

export async function listBank(filters: BankFilters): Promise<BankResult> {
  const query: Record<string, unknown> = { status: "published" };
  if (filters.section) query.sectionId = filters.section;
  if (filters.topic) query.topic = filters.topic;
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { stem: { $regex: escaped, $options: "i" } },
      { topic: { $regex: escaped, $options: "i" } },
      { tags: { $regex: escaped, $options: "i" } },
    ];
  }

  const page = Math.max(1, filters.page);
  const pageSize = Math.min(50, Math.max(5, filters.pageSize));
  const collection = await questions();
  const [items, total, topics] = await Promise.all([
    collection
      .find(query)
      .sort({ sectionId: 1, topic: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(query),
    collection.distinct("topic", { status: "published" }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    topics: (topics as string[]).filter(Boolean).sort(),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
