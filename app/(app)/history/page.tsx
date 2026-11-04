import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { listAttempts } from "@/lib/exam/queries";
import { formatDateTime, formatMarks, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();
  const attempts = await listAttempts(user.id);

  const submitted = attempts.filter((attempt) => attempt.status === "submitted");

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="History"
        title="Every paper you have written"
        description={`${submitted.length} submitted attempt${submitted.length === 1 ? "" : "s"} on this account.`}
        action={
          <Link
            href="/new"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            New mock
          </Link>
        }
      />

      {attempts.length === 0 ? (
        <EmptyState
          title="Your history is empty"
          description="Start your first paper. Results, section accuracy, and explanations will be stored here."
          action={
            <Link href="/new" className="text-sm font-medium text-emerald-700">
              Start a full mock
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Paper</th>
                  <th className="px-5 py-3 font-medium">Started</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Correct</th>
                  <th className="px-5 py-3 font-medium">Wrong</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/70">
                    <td className="max-w-xs px-5 py-3">
                      <p className="truncate font-medium text-slate-900">{attempt.title}</p>
                      <p className="text-xs text-slate-500">
                        {attempt.kind === "full" ? "Full mock" : "Drill"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      {formatDateTime(attempt.startedAt)}
                    </td>
                    <td className="px-5 py-3">
                      {attempt.status === "submitted" ? (
                        <Badge tone="green">Submitted</Badge>
                      ) : (
                        <Badge tone="amber">In progress</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-emerald-700">
                      {attempt.status === "submitted" ? attempt.correct : "—"}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-rose-700">
                      {attempt.status === "submitted" ? attempt.wrong : "—"}
                    </td>
                    <td className="px-5 py-3 tabular-nums font-medium text-slate-900">
                      {attempt.status === "submitted"
                        ? `${formatMarks(attempt.score)} · ${formatPercent(attempt.percent)}`
                        : "—"}
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
    </div>
  );
}
