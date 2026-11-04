import type { SectionScore, Score } from "@/lib/db/types";
import { EXAM_PATTERN } from "@/lib/exam/pattern";

export interface ScoreQuestion {
  questionId: string;
  sectionId: string;
  correctIndex: number | null;
  isBonus: boolean;
}

export interface ScoreAnswer {
  questionId: string;
  selectedIndex: number | null;
}

export interface Marking {
  correct: number;
  wrong: number;
  unattempted: number;
  bonus: number;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function scoreAttempt(
  questions: ScoreQuestion[],
  answers: ScoreAnswer[],
  marking: Marking = EXAM_PATTERN.marking,
): Score {
  const selected = new Map(answers.map((answer) => [answer.questionId, answer.selectedIndex]));
  const sections = new Map<string, SectionScore>();

  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let bonus = 0;
  let total = 0;

  for (const question of questions) {
    const section = sections.get(question.sectionId) ?? {
      sectionId: question.sectionId,
      total: 0,
      attempted: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
      bonus: 0,
      net: 0,
    };

    section.total += 1;

    if (question.isBonus) {
      bonus += 1;
      section.bonus += 1;
      section.net = round(section.net + marking.bonus);
      total = round(total + marking.bonus);
      sections.set(question.sectionId, section);
      continue;
    }

    const choice = selected.get(question.questionId) ?? null;
    if (choice === null || choice === undefined) {
      skipped += 1;
      section.skipped += 1;
      section.net = round(section.net + marking.unattempted);
    } else if (question.correctIndex !== null && choice === question.correctIndex) {
      correct += 1;
      section.correct += 1;
      section.attempted += 1;
      section.net = round(section.net + marking.correct);
      total = round(total + marking.correct);
    } else {
      wrong += 1;
      section.wrong += 1;
      section.attempted += 1;
      section.net = round(section.net + marking.wrong);
      total = round(total + marking.wrong);
    }

    sections.set(question.sectionId, section);
  }

  const max = questions.length;
  const percent = max > 0 ? round((total / max) * 100) : 0;

  return {
    total: round(total),
    max,
    percent,
    correct,
    wrong,
    skipped,
    bonus,
    sections: Array.from(sections.values()).sort((a, b) =>
      a.sectionId.localeCompare(b.sectionId),
    ),
  };
}
