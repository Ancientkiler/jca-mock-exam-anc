import { SettingsClient } from "@/components/settings-client";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your account, your password, and a portable copy of your data."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{user.displayName}</h2>
            <p className="text-sm text-slate-500">@{user.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={user.role === "admin" ? "green" : "slate"}>
              {user.role === "admin" ? "Administrator" : "Candidate"}
            </Badge>
            <span className="text-xs text-slate-500">Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Accounts are created by the administrator. There is no public
          registration, and administrators cannot reset another person&apos;s
          password — only you can change your own.
        </p>
      </Card>

      <SettingsClient />
    </div>
  );
}
