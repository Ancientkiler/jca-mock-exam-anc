"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function SettingsClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("password");
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not change password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function downloadBackup() {
    setBusy("backup");
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/backup");
      if (!response.ok) throw new Error("Backup failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `jca-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Backup downloaded.");
    } catch {
      setError("Could not download backup.");
    } finally {
      setBusy(null);
    }
  }

  async function restoreBackup(file: File) {
    setBusy("restore");
    setMessage(null);
    setError(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const response = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        attempts?: number;
      };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not restore backup");
        return;
      }
      setMessage(`Restored ${data.attempts ?? 0} attempts.`);
      router.refresh();
    } catch {
      setError("Invalid backup file.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function resetData() {
    if (!window.confirm("Delete all your attempts, answers, and history?")) return;
    if (!window.confirm("This cannot be undone. Continue?")) return;
    setBusy("reset");
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/reset", { method: "POST" });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not reset data");
        return;
      }
      setMessage("Your attempt data was deleted.");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <p className="mt-1 text-sm text-slate-600">
          Your password is stored as a bcrypt hash. Only you can change it.
        </p>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="New password (6+ characters)"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={busy === "password"}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "password" ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Your data</h2>
        <p className="mt-1 text-sm text-slate-600">
          Attempts, answers, and history are private to your account.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadBackup}
            disabled={busy === "backup"}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "backup" ? "Preparing…" : "Download backup"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy === "restore"}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "restore" ? "Restoring…" : "Restore backup"}
          </button>
          <button
            type="button"
            onClick={resetData}
            disabled={busy === "reset"}
            className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            {busy === "reset" ? "Deleting…" : "Reset my data"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void restoreBackup(file);
            }}
          />
        </div>
      </section>

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 lg:col-span-2">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 lg:col-span-2"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
