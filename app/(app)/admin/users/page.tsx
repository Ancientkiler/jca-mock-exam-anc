import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { listUserSummaries } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate, formatDateTime, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const summaries = await listUserSummaries();
  const candidates = summaries.filter((user) => user.role === "user");
  const admins = summaries.filter((user) => user.role === "admin");

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Admin · Users"
        title="Candidate performance"
        description="One row per account. Open a candidate to see their attempts, section accuracy, and most-missed questions."
        action={
          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to overview
          </Link>
        }
      />

      {candidates.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description="Seed the database to create user1 through user5."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((user) => (
            <Link key={user.id} href={`/admin/users/${user.id}`} className="group">
              <Card className="h-full transition group-hover:border-emerald-300 group-hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </div>
                  <Badge tone={user.active ? "green" : "red"}>
                    {user.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 px-2 py-2">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">
                      Papers
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {user.attempts}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-2 py-2">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">
                      Average
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatPercent(user.avgPercent)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-2 py-2">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">
                      Best
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatPercent(user.bestPercent)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <ProgressBar value={user.avgPercent} />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Last paper {formatDateTime(user.lastSubmittedAt)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Joined {formatDate(user.createdAt)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {admins.length > 0 ? (
        <Card>
          <h2 className="text-sm font-semibold text-slate-900">Administrators</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {admins.map((user) => (
              <li key={user.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  <span className="font-medium text-slate-800">{user.displayName}</span>
                  <span className="ml-2 text-xs text-slate-500">@{user.username}</span>
                </span>
                <Badge tone="green">Admin</Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
