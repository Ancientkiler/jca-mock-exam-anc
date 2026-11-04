import Link from "next/link";
import { Badge, Card, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { getAdminOverview } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDateTime, formatMarks, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin console"
        title="Performance across all candidates"
        description="Aggregate results, section accuracy, and the questions most often missed. Passwords are never exposed."
        action={
          <Link
            href="/admin/users"
            className="rounded-xl bg-[#12211c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b332b]"
          >
            All users
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Candidates"
          value={overview.users}
          hint={`${overview.activeUsers} active accounts`}
        />
        <StatCard
          label="Submitted papers"
          value={overview.submittedAttempts}
          hint={`${overview.inProgressAttempts} in progress`}
        />
        <StatCard
          label="Average score"
          value={formatPercent(overview.averagePercent)}
          hint="Across all submitted papers"
        />
        <StatCard
          label="Pass rate"
          value={formatPercent(overview.passRate)}
          hint="Score of 50 or above"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Section accuracy</h2>
            <p className="text-xs text-slate-500">All candidates, all submitted papers</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {overview.sections.map((section) => (
              <li key={section.sectionId} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">{section.section}</p>
                  <div className="text-right">
                    <span className="text-xs font-semibold tabular-nums text-slate-700">
                      {formatPercent(section.accuracy)}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {section.correct} correct · {section.wrong} wrong
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <ProgressBar value={section.accuracy} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Most missed questions</h2>
            <p className="text-xs text-slate-500">Wrong answers across every candidate</p>
          </div>
          {overview.mostMissed.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">
              No wrong answers recorded yet.
            </p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {overview.mostMissed.map((question) => (
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
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent submissions</h2>
            <p className="text-xs text-slate-500">The last ten submitted papers</p>
          </div>
          <Link href="/admin/users" className="text-xs font-medium text-emerald-700">
            Open user list
          </Link>
        </div>

        {overview.recentAttempts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            No candidate has submitted a paper yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="px-5 py-3 font-medium">Paper</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/users/${attempt.userId}`}
                        className="font-medium text-slate-900 hover:text-emerald-700"
                      >
                        {attempt.displayName}
                      </Link>
                      <p className="text-xs text-slate-500">@{attempt.username}</p>
                    </td>
                    <td className="max-w-xs px-5 py-3">
                      <p className="truncate text-slate-700">{attempt.title}</p>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-800">
                      {formatMarks(attempt.score)} · {formatPercent(attempt.percent)}
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
