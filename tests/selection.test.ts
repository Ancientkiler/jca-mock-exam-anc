import { describe, expect, it } from "vitest";
import {
  pickForPattern,
  pickQuestions,
  type Candidate,
  type CandidateHistory,
} from "@/lib/exam/selection";

const candidates: Candidate[] = [
  { id: "q1", sectionId: "english" },
  { id: "q2", sectionId: "english" },
  { id: "q3", sectionId: "english" },
  { id: "q4", sectionId: "english" },
  { id: "q5", sectionId: "english" },
];

function history(entries: Record<string, CandidateHistory>) {
  return new Map(Object.entries(entries));
}

describe("question selection", () => {
  it("prioritises unseen questions", () => {
    const picked = pickQuestions(
      candidates,
      2,
      history({ q1: { attempts: 3, wrong: 1 } }),
      "unseen",
      () => 0.5,
    );

    expect(picked).toHaveLength(2);
    expect(picked.map((item) => item.id)).not.toContain("q1");
  });

  it("puts wrong answers ahead of correct ones in weak mode", () => {
    const picked = pickQuestions(
      candidates.slice(0, 2),
      1,
      history({
        q1: { attempts: 2, wrong: 2 },
        q2: { attempts: 1, wrong: 0 },
      }),
      "weak",
      () => 0.5,
    );

    expect(picked.map((item) => item.id)).toEqual(["q1"]);
  });

  it("puts unseen questions before previously seen ones in weak mode", () => {
    const picked = pickQuestions(
      candidates,
      3,
      history({
        q1: { attempts: 2, wrong: 2 },
        q2: { attempts: 1, wrong: 0 },
      }),
      "weak",
      () => 0.5,
    );

    const ids = picked.map((item) => item.id);
    expect(ids).toContain("q3");
    expect(ids).toContain("q4");
    expect(ids).toContain("q5");
  });

  it("returns at most the requested count", () => {
    const picked = pickQuestions(candidates, 2, history({}), "weak", () => 0.5);
    expect(picked).toHaveLength(2);
  });

  it("returns every candidate when the count exceeds the pool", () => {
    const picked = pickQuestions(candidates, 99, history({}), "random", () => 0.5);
    expect(picked).toHaveLength(candidates.length);
    expect(new Set(picked.map((item) => item.id)).size).toBe(candidates.length);
  });

  it("returns nothing for a zero or negative count", () => {
    expect(pickQuestions(candidates, 0, history({}), "weak")).toEqual([]);
    expect(pickQuestions(candidates, -3, history({}), "weak")).toEqual([]);
  });

  it("respects each section quota when assembling a pattern", () => {
    const pool = new Map<string, Candidate[]>([
      [
        "english",
        [
          { id: "e1", sectionId: "english" },
          { id: "e2", sectionId: "english" },
          { id: "e3", sectionId: "english" },
        ],
      ],
      [
        "gk",
        [
          { id: "g1", sectionId: "gk" },
          { id: "g2", sectionId: "gk" },
        ],
      ],
    ]);

    const picked = pickForPattern(
      pool,
      [
        { id: "english", count: 2 },
        { id: "gk", count: 1 },
      ],
      history({}),
      () => 0.5,
    );

    const bySection = picked.reduce<Record<string, number>>((acc, item) => {
      acc[item.sectionId] = (acc[item.sectionId] ?? 0) + 1;
      return acc;
    }, {});

    expect(picked).toHaveLength(3);
    expect(bySection).toEqual({ english: 2, gk: 1 });
  });
});
