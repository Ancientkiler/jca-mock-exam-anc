import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { getUserPerformance } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate, formatDateTime, formatMarks, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const performance = await getUserPerformance(id);
  if (!performance) notFound();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Admin · Candidate"
        title={performance.displayName}
        description={`@${performance.username} · joined ${formatDate(performance.createdAt)} · last login ${formatDateTime(performance.lastLoginAt)}`}
        action={
          <div className="flex gap-2">
            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              All users
            </Link>
            <Link
              href="/admin"
              className="rounded-xl bg-[#12211c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b332b]"
            >
              Overview
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Submitted" value={performance.submitted} hint={`${performance.inProgress} in progress`} />
        <StatCard label="Average" value={formatPercent(performance.averagePercent)} hint="All submitted papers" />
        <StatCard label="Best" value={formatPercent(performance.bestPercent)} hint="Highest paper score" />
        <StatCard
          label="Account"
          value={performance.active ? "Active" : "Inactive"}
          hint={performance.role === "admin" ? "Administrator" : "Candidate"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Section accuracy</h2>
            <p className="text-xs text-slate-500">Correct ÷ attempted for this candidate</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {performance.sections.map((section) => (
              <li key={section.sectionId} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">{section.section}</p>
                  <span className="text-xs font-semibold tabular-nums text-slate-700">
                    {formatPercent(section.accuracy)}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={section.accuracy} />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {section.correct} correct · {section.wrong} wrong · {section.total} questions seen
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Most missed</h2>
            <p className="text-xs text-slate-500">Questions this candidate keeps getting wrong</p>
          </div>
          {performance.mostMissed.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">No wrong answers yet.</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {performance.mostMissed.map((question) => (
                <li key={question.questionId} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone="blue">{question.section}</Badge>
                    <span className="text-xs font-semibold text-rose-700">
                      {question.wrong} wrong
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-700">
                    {question.stem}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Attempt history</h2>
          <p className="text-xs text-slate-500">Latest twenty submitted papers</p>
        </div>

        {performance.attempts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">This candidate has not submitted a paper.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Paper</th>
                  <th className="px-5 py-3 font-medium">Kind</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Percent</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performance.attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/70">
                    <td className="max-w-xs px-5 py-3">
                      <p className="truncate font-medium text-slate-800">{attempt.title}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={attempt.kind === "full" ? "blue" : "slate"}>
                        {attempt.kind === "full" ? "Full mock" : "Drill"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-800">
                      {formatMarks(attempt.score)}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-800">
                      {formatPercent(attempt.percent)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      {formatDateTime(attempt.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
