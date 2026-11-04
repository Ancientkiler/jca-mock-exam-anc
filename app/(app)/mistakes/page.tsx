import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { listMistakes } from "@/lib/exam/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const user = await requireUser();
  const mistakes = await listMistakes(user.id);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mistake notebook"
        title="What you got wrong"
        description="Every wrong answer you have saved, newest first. Fix the pattern, not just the question."
        action={
          <Link
            href="/drill"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Drill these areas
          </Link>
        }
      />

      {mistakes.length === 0 ? (
        <EmptyState
          title="No mistakes recorded yet"
          description="Once you submit a paper or drill, every wrong answer lands here with the correct option and explanation."
          action={
            <Link href="/new" className="text-sm font-medium text-emerald-700">
              Start a full mock
            </Link>
          }
        />
      ) : (
        <ol className="space-y-4">
          {mistakes.map((item) => (
            <li key={item.questionId}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="blue">{item.section}</Badge>
                  {item.topic ? <Badge>{item.topic}</Badge> : null}
                  <span className="ml-auto text-xs text-slate-400">
                    Last missed {formatDateTime(item.lastAttemptAt)}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-900">
                  {item.stem}
                </p>

                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {item.options.map((option, index) => {
                    const isCorrect = item.correctIndex === index;
                    const isChosen = item.selectedIndex === index;
                    return (
                      <li
                        key={index}
                        className={
                          isCorrect
                            ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                            : isChosen
                              ? "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
                              : "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        }
                      >
                        <span className="mr-2 font-semibold text-slate-400">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                        {isCorrect ? (
                          <span className="ml-2 text-xs font-medium text-emerald-700">correct</span>
                        ) : null}
                        {isChosen ? (
                          <span className="ml-2 text-xs font-medium text-rose-700">your answer</span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                {item.explanation ? (
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700">
                    {item.explanation}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
