import Link from "next/link";
import { StartMockButton } from "@/components/start-mock-button";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatCard,
} from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { getDashboard } from "@/lib/exam/queries";
import { EXAM_PATTERN } from "@/lib/exam/pattern";
import { formatDateTime, formatMarks, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboard(user.id);

  const firstName = user.displayName.split(" ")[0] || user.displayName;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your desk"
        title={`Welcome back, ${firstName}`}
        description="Pick up where you left off, or build a fresh paper from the bank."
        action={<StartMockButton />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Papers submitted"
          value={data.submitted}
          hint={`${data.inProgress} in progress`}
        />
        <StatCard
          label="Average score"
          value={formatPercent(data.averagePercent)}
          hint={`Pass mark ${EXAM_PATTERN.passMark} · target ${EXAM_PATTERN.targetMark}`}
        />
        <StatCard
          label="Best score"
          value={formatPercent(data.bestPercent)}
          hint={`${data.totalQuestions} questions in the bank`}
        />
        <StatCard
          label="Time on questions"
          value={`${data.studyMinutes} min`}
          hint="Across all saved answers"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-[#12211c]/10 bg-[#12211c] p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Full mock
          </p>
          <h2 className="mt-2 max-w-md font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            100 questions. 90 minutes. One honest score.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50/70">
            The paper is assembled fresh each time: unseen questions first, then
            the ones you have missed, across all seven sections.          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-lg font-semibold">
                {EXAM_PATTERN.sections.reduce((sum, section) => sum + section.count, 0)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-100/60">
                Questions
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-lg font-semibold">{EXAM_PATTERN.durationSec / 60}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-100/60">
                Minutes
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-lg font-semibold">−0.25</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-100/60">
                Per wrong
              </p>
            </div>
          </div>
          <div className="mt-7">
            <StartMockButton />
          </div>
        </section>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Section accuracy</h2>
              <p className="text-xs text-slate-500">Correct ÷ attempted, all papers</p>
            </div>
            <Link
              href="/mistakes"
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Review mistakes
            </Link>
          </div>

          {data.sections.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">
              Finish a paper to see where you are strong and where you are losing
              marks.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.sections.map((section) => (
                <li key={section.section} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">
                      {section.section}
                    </p>
                    <span className="text-xs font-semibold tabular-nums text-slate-600">
                      {formatPercent(section.accuracy)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={section.accuracy} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Recent attempts
            </h2>
            <p className="text-sm text-slate-500">Your last five papers and drills.</p>
          </div>
          <Link
            href="/history"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            View all
          </Link>
        </div>

        {data.recent.length === 0 ? (
          <EmptyState
            title="No attempts yet"
            description="Start a full mock to set your baseline. You can review every question and explanation afterwards."
            action={<StartMockButton />}
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Paper</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Started</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/70">
                      <td className="max-w-xs px-5 py-3">
                        <p className="truncate font-medium text-slate-900">
                          {attempt.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {attempt.kind === "full" ? "Full mock" : "Drill"}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {attempt.status === "submitted" ? (
                          <Badge tone="green">Submitted</Badge>
                        ) : (
                          <Badge tone="amber">In progress</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 tabular-nums text-slate-700">
                        {attempt.status === "submitted" ? (
                          <span>
                            {formatMarks(attempt.score)} · {formatPercent(attempt.percent)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDateTime(attempt.startedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={
                            attempt.status === "submitted"
                              ? `/result/${attempt.id}`
                              : `/attempt/${attempt.id}`
                          }
                          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          {attempt.status === "submitted" ? "Review" : "Resume"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
