export const SECTIONS = [
  { id: "english", name: "English" },
  { id: "aptitude", name: "Aptitude" },
  { id: "gk", name: "GK" },
  { id: "constitution", name: "Constitution" },
  { id: "sc-rules-2013", name: "SC Rules 2013" },
  { id: "sci-rules-1961", name: "Rules 1961" },
  { id: "computer", name: "Computer" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const SECTION_IDS = SECTIONS.map((section) => section.id);

export function sectionName(id: string): string {
  return SECTIONS.find((section) => section.id === id)?.name ?? id;
}

export const EXAM_PATTERN = {
  title: "Full mock - 2026 pattern",
  durationSec: 90 * 60,
  passMark: 50,
  targetMark: 78,
  marking: {
    correct: 1,
    wrong: -0.25,
    unattempted: 0,
    bonus: 1,
  },
  sections: [
    { id: "english", count: 20 },
    { id: "aptitude", count: 15 },
    { id: "gk", count: 15 },
    { id: "constitution", count: 15 },
    { id: "sc-rules-2013", count: 10 },
    { id: "sci-rules-1961", count: 10 },
    { id: "computer", count: 15 },
  ],
} as const;

export const TOTAL_QUESTIONS = EXAM_PATTERN.sections.reduce(
  (total, section) => total + section.count,
  0,
);

export const DRILL_SECONDS_PER_QUESTION = 90;
export const DRILL_COUNTS = [5, 10, 15, 20, 30] as const;
