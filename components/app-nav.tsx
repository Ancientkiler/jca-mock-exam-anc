"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/new", label: "New mock" },
  { href: "/drill", label: "Drill" },
  { href: "/bank", label: "Bank" },
  { href: "/mistakes", label: "Mistakes" },
  { href: "/history", label: "History" },
  { href: "/learn", label: "Learn" },
  { href: "/settings", label: "Settings" },
];

export function AppNav({
  displayName,
  username,
  role,
}: {
  displayName: string;
  username: string;
  role: "user" | "admin";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            J
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            JCA Mock Exam
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">@{username}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loggingOut ? "…" : "Log out"}
          </button>
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 lg:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {open ? (
        <nav className="grid gap-1 border-t border-slate-200 px-4 py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                pathname === link.href
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {link.label}
            </Link>
          ))}
          {role === "admin" ? (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
            >
              Admin
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
