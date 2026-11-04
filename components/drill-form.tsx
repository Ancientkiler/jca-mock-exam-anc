"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DRILL_COUNTS, SECTIONS } from "@/lib/exam/pattern";

export function DrillForm({
  sectionCounts,
}: {
  sectionCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [sectionId, setSectionId] = useState("");
  const [count, setCount] = useState(10);
  const [order, setOrder] = useState<"weak" | "unseen" | "random">("weak");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "drill",
          ...(sectionId ? { sectionId } : {}),
          count,
          order,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        attemptId?: string;
      };
      if (!response.ok || !data.ok || !data.attemptId) {
        setError(data.error || "Could not start the drill");
        return;
      }
      router.push(`/attempt/${data.attemptId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={start} className="space-y-5">
      <div>
        <label htmlFor="section" className="text-sm font-medium text-slate-700">
          Section
        </label>
        <select
          id="section"
          value={sectionId}
          onChange={(event) => setSectionId(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All sections</option>
          {SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name} ({sectionCounts[section.id] ?? 0})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="count" className="text-sm font-medium text-slate-700">
          Questions
        </label>
        <select
          id="count"
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          {DRILL_COUNTS.map((value) => (
            <option key={value} value={value}>
              {value} questions · {value * 1.5} minutes
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">
          Question order
        </legend>
        <div className="mt-2 grid gap-2">
          {[
            {
              value: "weak" as const,
              title: "Unseen and weak",
              hint: "Questions you have never seen, then the ones you got wrong.",
            },
            {
              value: "unseen" as const,
              title: "Never seen",
              hint: "Questions with the fewest previous attempts.",
            },
            {
              value: "random" as const,
              title: "Random mix",
              hint: "A random draw from the bank.",
            },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 hover:border-slate-300"
            >
              <input
                type="radio"
                name="order"
                value={option.value}
                checked={order === option.value}
                onChange={() => setOrder(option.value)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  {option.title}
                </span>
                <span className="block text-xs text-slate-500">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Building drill…" : "Start drill"}
      </button>
    </form>
  );
}
