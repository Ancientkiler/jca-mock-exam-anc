import { describe, expect, it } from "vitest";
import { scoreAttempt, type ScoreQuestion } from "@/lib/exam/scoring";

function question(
  questionId: string,
  sectionId: string,
  correctIndex: number | null,
  isBonus = false,
): ScoreQuestion {
  return { questionId, sectionId, correctIndex, isBonus };
}

describe("scoring", () => {
  it("awards +1 for a correct answer", () => {
    const score = scoreAttempt(
      [question("q1", "english", 2)],
      [{ questionId: "q1", selectedIndex: 2 }],
    );

    expect(score.total).toBe(1);
    expect(score.correct).toBe(1);
    expect(score.wrong).toBe(0);
    expect(score.skipped).toBe(0);
  });

  it("deducts 0.25 for a wrong answer", () => {
    const score = scoreAttempt(
      [question("q1", "english", 2)],
      [{ questionId: "q1", selectedIndex: 0 }],
    );

    expect(score.total).toBe(-0.25);
    expect(score.wrong).toBe(1);
  });

  it("scores a skipped answer as zero", () => {
    const score = scoreAttempt(
      [question("q1", "english", 2)],
      [{ questionId: "q1", selectedIndex: null }],
    );

    expect(score.total).toBe(0);
    expect(score.skipped).toBe(1);
  });

  it("awards +1 to a bonus question regardless of the choice", () => {
    const score = scoreAttempt(
      [question("q1", "english", null, true)],
      [{ questionId: "q1", selectedIndex: 3 }],
    );

    expect(score.total).toBe(1);
    expect(score.bonus).toBe(1);
    expect(score.correct).toBe(0);
    expect(score.wrong).toBe(0);
  });

  it("combines correct, wrong, skipped, and bonus into a total", () => {
    const score = scoreAttempt(
      [
        question("q1", "english", 1),
        question("q2", "aptitude", 0),
        question("q3", "gk", 2),
        question("q4", "computer", null, true),
      ],
      [
        { questionId: "q1", selectedIndex: 1 },
        { questionId: "q2", selectedIndex: 3 },
        { questionId: "q3", selectedIndex: null },
        { questionId: "q4", selectedIndex: null },
      ],
    );

    expect(score.total).toBe(1.75);
    expect(score.max).toBe(4);
    expect(score.correct).toBe(1);
    expect(score.wrong).toBe(1);
    expect(score.skipped).toBe(1);
    expect(score.bonus).toBe(1);
    expect(score.percent).toBe(43.75);
  });

  it("totals per-section marks to the overall total", () => {
    const score = scoreAttempt(
      [
        question("q1", "english", 1),
        question("q2", "english", 0),
        question("q3", "constitution", 2),
      ],
      [
        { questionId: "q1", selectedIndex: 1 },
        { questionId: "q2", selectedIndex: 2 },
        { questionId: "q3", selectedIndex: 2 },
      ],
    );

    const sectionTotal = score.sections.reduce(
      (sum, section) => sum + section.net,
      0,
    );
    expect(score.total).toBe(1.75);
    expect(sectionTotal).toBe(1.75);

    const english = score.sections.find((section) => section.sectionId === "english");
    expect(english).toMatchObject({
      total: 2,
      attempted: 2,
      correct: 1,
      wrong: 1,
      skipped: 0,
      net: 0.75,
    });
  });

  it("handles an empty answer set", () => {
    const score = scoreAttempt([], []);
    expect(score.total).toBe(0);
    expect(score.max).toBe(0);
    expect(score.percent).toBe(0);
    expect(score.sections).toEqual([]);
  });
});
