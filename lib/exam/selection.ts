export type SelectionMode = "weak" | "unseen" | "random";

export interface Candidate {
  id: string;
  sectionId: string;
}

export interface CandidateHistory {
  attempts: number;
  wrong: number;
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function priority(
  candidate: Candidate,
  history: Map<string, CandidateHistory>,
  mode: SelectionMode,
): number {
  const record = history.get(candidate.id);
  if (mode === "random") return 0;
  if (!record || record.attempts === 0) return 0;
  if (mode === "unseen") return 1000 + record.attempts;
  if (record.wrong > 0) return 1000 - Math.min(record.wrong, 900);
  return 2000 + record.attempts;
}

export function pickQuestions(
  candidates: Candidate[],
  count: number,
  history: Map<string, CandidateHistory>,
  mode: SelectionMode,
  random: () => number = Math.random,
): Candidate[] {
  if (count <= 0) return [];
  const grouped = new Map<number, Candidate[]>();
  for (const candidate of candidates) {
    const key = priority(candidate, history, mode);
    const bucket = grouped.get(key) ?? [];
    bucket.push(candidate);
    grouped.set(key, bucket);
  }

  const keys = Array.from(grouped.keys()).sort((a, b) => a - b);
  const picked: Candidate[] = [];
  for (const key of keys) {
    const bucket = shuffled(grouped.get(key) ?? [], random);
    for (const candidate of bucket) {
      if (picked.length >= count) break;
      picked.push(candidate);
    }
    if (picked.length >= count) break;
  }
  return picked;
}

export function pickForPattern(
  candidatesBySection: Map<string, Candidate[]>,
  quotas: readonly { id: string; count: number }[],
  history: Map<string, CandidateHistory>,
  random: () => number = Math.random,
): Candidate[] {
  const picked: Candidate[] = [];
  for (const quota of quotas) {
    const candidates = candidatesBySection.get(quota.id) ?? [];
    const selected = pickQuestions(candidates, quota.count, history, "weak", random);
    picked.push(...selected);
  }
  return picked;
}
