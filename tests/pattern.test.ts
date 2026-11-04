import { describe, expect, it } from "vitest";
import {
  DRILL_COUNTS,
  EXAM_PATTERN,
  SECTION_IDS,
  SECTIONS,
  TOTAL_QUESTIONS,
  sectionName,
} from "@/lib/exam/pattern";

describe("exam pattern", () => {
  it("builds a 100 question paper across seven sections", () => {
    expect(TOTAL_QUESTIONS).toBe(100);
    expect(EXAM_PATTERN.sections).toHaveLength(7);
    expect(SECTIONS).toHaveLength(7);
  });

  it("has unique section ids and names", () => {
    expect(new Set(SECTION_IDS).size).toBe(SECTION_IDS.length);
    expect(new Set(SECTIONS.map((section) => section.name)).size).toBe(
      SECTIONS.length,
    );
  });

  it("matches the published section quotas", () => {
    const quotas = Object.fromEntries(
      EXAM_PATTERN.sections.map((section) => [section.id, section.count]),
    );
    expect(quotas).toEqual({
      english: 20,
      aptitude: 15,
      gk: 15,
      constitution: 15,
      "sc-rules-2013": 10,
      "sci-rules-1961": 10,
      computer: 15,
    });
  });

  it("uses a 90 minute clock and the correct marking scheme", () => {
    expect(EXAM_PATTERN.durationSec).toBe(90 * 60);
    expect(EXAM_PATTERN.marking).toEqual({
      correct: 1,
      wrong: -0.25,
      unattempted: 0,
      bonus: 1,
    });
    expect(EXAM_PATTERN.passMark).toBe(50);
    expect(EXAM_PATTERN.targetMark).toBe(78);
  });

  it("exposes drill sizes and resolves section names", () => {
    expect(DRILL_COUNTS).toEqual([5, 10, 15, 20, 30]);
    expect(sectionName("constitution")).toBe("Constitution");
    expect(sectionName("unknown-section")).toBe("unknown-section");
  });
});
