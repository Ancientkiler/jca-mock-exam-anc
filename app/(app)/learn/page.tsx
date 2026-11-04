import { Badge, Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { EXAM_PATTERN, sectionName } from "@/lib/exam/pattern";

export const dynamic = "force-dynamic";

const NOTES: Record<
  string,
  { focus: string; notes: string[]; traps: string }
> = {
  english: {
    focus: "Comprehension speed, grammar rules, and vocabulary in context.",
    notes: [
      "Read the passage once for structure, then answer; do not hunt line by line.",
      "Revise subject–verb agreement, articles, prepositions, and tense consistency.",
      "For idioms and one-word substitutions, eliminate literal meanings first.",
      "Keep a personal list of every word you miss; revise it weekly.",
    ],
    traps: "Extreme options ('always', 'never') are usually wrong in comprehension.",
  },
  aptitude: {
    focus: "Arithmetic, reasoning, and data interpretation under time pressure.",
    notes: [
      "Master percentages, ratios, averages, profit–loss, and time–work.",
      "Learn tables to 20 and squares to 30 to cut calculation time.",
      "For series and coding questions, write the pattern before choosing.",
      "Skip a calculation that will take more than 90 seconds; return later.",
    ],
    traps: "Unit mismatches (minutes vs hours, rupees vs paise) are common.",
  },
  gk: {
    focus: "Current affairs, polity, history, geography, and general science.",
    notes: [
      "Follow Supreme Court appointments, judgments, and constitutional changes.",
      "Revise static GK in small, repeated passes rather than one long read.",
      "Link current events to their constitutional or institutional context.",
      "Use the bank filters to revise one topic at a time.",
    ],
    traps: "Questions often test the latest position, not the general rule.",
  },
  constitution: {
    focus: "The text and structure of the Constitution, especially the judiciary.",
    notes: [
      "Know Articles 124–147 thoroughly: appointment, tenure, jurisdiction, rules.",
      "Revise fundamental rights, writs, and the basic structure doctrine.",
      "Track amendments and landmark judgments mentioned in the paper.",
      "When two options look right, choose the one closest to the constitutional text.",
    ],
    traps: "Article numbers are easy to confuse; build a one-page map.",
  },
  "sc-rules-2013": {
    focus: "Supreme Court Rules, 2013 — procedure, filing, and court practice.",
    notes: [
      "Learn the order structure: institution, scrutiny, listing, hearing.",
      "Revise provisions on affidavits, applications, and defect removal.",
      "Note the rules on service, limitation, and condonation of delay.",
      "Read the rule, not a summary, for numbers and time limits.",
    ],
    traps: "Days vs working days, and the specific form prescribed, decide the answer.",
  },
  "sci-rules-1961": {
    focus: "Supreme Court Rules, 1961 and the practices they preserve.",
    notes: [
      "Compare the 1961 and 2013 rules where the 2013 rules carry forward old practice.",
      "Revise terminology that still appears in court filings.",
      "Focus on provisions the 2013 rules expressly save or repeal.",
      "Use the bank to spot repeated phrasing from previous papers.",
    ],
    traps: "A rule repeated in substance may still differ in a number or form.",
  },
  computer: {
    focus: "Fundamentals, office tools, internet, and security.",
    notes: [
      "Revise hardware, memory units, operating-system basics, and file types.",
      "Practise spreadsheet formulas and word-processing shortcuts.",
      "Know email protocols, browsers, and common network terms.",
      "Revise cyber hygiene: passwords, phishing, malware, and backups.",
    ],
    traps: "Shortcut keys and protocol names are the most commonly swapped facts.",
  },
};

export default async function LearnPage() {
  await requireUser();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Study notes"
        title="A short map of the syllabus"
        description="Not a textbook. A set of directions for what to revise and how the paper usually tests it."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-[#12211c] text-white">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">Pass</p>
          <p className="mt-2 text-3xl font-semibold">{EXAM_PATTERN.passMark}</p>
          <p className="mt-1 text-xs text-emerald-100/60">marks out of 100</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Target</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {EXAM_PATTERN.targetMark}
          </p>
          <p className="mt-1 text-xs text-slate-500">a competitive score</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Net per wrong</p>
          <p className="mt-2 text-3xl font-semibold text-rose-700">−0.25</p>
          <p className="mt-1 text-xs text-slate-500">guess only with an edge</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {EXAM_PATTERN.sections.map((section) => {
          const note = NOTES[section.id];
          return (
            <Card key={section.id}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">
                  {sectionName(section.id)}
                </h2>
                <Badge tone="blue">{section.count} questions</Badge>
              </div>
              {note ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{note.focus}</p>
                  <ul className="mt-3 space-y-1.5 text-sm leading-5 text-slate-700">
                    {note.notes.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-emerald-500" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    Watch out: {note.traps}
                  </p>
                </>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/60">
        <h2 className="text-sm font-semibold text-emerald-900">A weekly loop that works</h2>
        <ol className="mt-2 grid gap-2 text-sm leading-6 text-emerald-900/80 sm:grid-cols-2">
          <li>1. One full mock under exam conditions.</li>
          <li>2. Review every wrong answer the same day.</li>
          <li>3. Two short drills on the weakest sections.</li>
          <li>4. Re-read notes and revisit the mistake notebook.</li>
        </ol>
      </Card>
    </div>
  );
}
