import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge, Card, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { EXAM_PATTERN, sectionName } from "@/lib/exam/pattern";
import { getAttemptForUser } from "@/lib/exam/service";
import { formatDateTime, formatMarks, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const view = await getAttemptForUser(id, user.id);
  if (!view) notFound();
  if (view.attempt.status !== "submitted") redirect(`/attempt/${id}`);

  const score = view.attempt.score;
  if (!score) notFound();

  const answerMap = new Map(view.answers.map((answer) => [answer.questionId, answer]));
  const passed = score.total >= EXAM_PATTERN.passMark;
  const attempted = score.correct + score.wrong;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Result"
        title={view.test.title}
        description={`Submitted ${formatDateTime(view.attempt.submittedAt)} · ${score.max} questions · ${Math.round(view.test.durationSec / 60)} minutes`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/history"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              History
            </Link>
            <Link
              href="/new"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              New mock
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-[#12211c] p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">Score</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums">
                {formatMarks(score.total)}
                <span className="text-lg font-medium text-emerald-100/50"> / {score.max}</span>
              </p>
            </div>
            <Badge tone={passed ? "green" : "red"}>{passed ? "Pass" : "Below pass"}</Badge>
          </div>
          <p className="mt-3 text-xs text-emerald-100/60">
            {formatPercent(score.percent)} · pass mark {EXAM_PATTERN.passMark} · target{" "}
            {EXAM_PATTERN.targetMark}
          </p>
          <div className="mt-3">
            <ProgressBar value={score.percent} />
          </div>
        </Card>
        <StatCard label="Correct" value={score.correct} hint={`${attempted} attempted`} />
        <StatCard label="Wrong" value={score.wrong} hint="−0.25 each" />
        <StatCard
          label="Skipped"
          value={score.skipped}
          hint={score.bonus > 0 ? `${score.bonus} bonus question(s)` : "No penalty"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Section breakdown</h2>
            <p className="text-xs text-slate-500">Net marks and accuracy by section</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Section</th>
                  <th className="px-4 py-2.5 text-right font-medium">Net</th>
                  <th className="px-4 py-2.5 text-right font-medium">C</th>
                  <th className="px-4 py-2.5 text-right font-medium">W</th>
                  <th className="px-4 py-2.5 text-right font-medium">Skip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {score.sections.map((section) => (
                  <tr key={section.sectionId}>
                    <td className="px-4 py-2.5 text-slate-800">
                      {sectionName(section.sectionId)}
                      {section.bonus > 0 ? (
                        <span className="ml-2 text-[10px] font-medium text-emerald-700">
                          bonus
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-900">
                      {formatMarks(section.net)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-emerald-700">
                      {section.correct}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-rose-700">
                      {section.wrong}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                      {section.skipped}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900">How to read this result</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>
              · <span className="font-medium text-slate-800">Net</span> is the marks after
              the 0.25 penalty.
            </li>
            <li>
              · <span className="font-medium text-slate-800">Skipped</span> questions cost
              nothing. A blind guess costs 0.25 on average.
            </li>
            <li>
              · Bonus questions award +1 to everyone, regardless of the selected option.
            </li>
            <li>
              · Section accuracy below 50% is where the next drill should start.
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/mistakes"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open mistake notebook
            </Link>
            <Link
              href="/drill"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Start a drill
            </Link>
          </div>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Question review
            </h2>
            <p className="text-sm text-slate-500">
              Correct answers and explanations for all {score.max} questions.
            </p>
          </div>
        </div>

        <ol className="space-y-4">
          {view.questions.map((question, index) => {
            const answer = answerMap.get(question._id);
            const selected = answer?.selectedIndex ?? null;
            const isCorrect =
              selected !== null && (question.isBonus || selected === question.correctIndex);
            const isWrong = selected !== null && !isCorrect;
            const skipped = selected === null;

            return (
              <li key={question._id}>
                <Card>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <Badge tone="blue">{sectionName(question.sectionId)}</Badge>
                    {question.topic ? <Badge>{question.topic}</Badge> : null}
                    {question.isBonus ? <Badge tone="green">Bonus</Badge> : null}
                    <span className="ml-auto">
                      {isCorrect ? (
                        <Badge tone="green">Correct</Badge>
                      ) : isWrong ? (
                        <Badge tone="red">Wrong</Badge>
                      ) : (
                        <Badge>Skipped</Badge>
                      )}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-900">
                    {question.stem}
                  </p>

                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => {
                      const correct = question.correctIndex === optionIndex;
                      const chosen = selected === optionIndex;
                      return (
                        <li
                          key={optionIndex}
                          className={
                            correct
                              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                              : chosen
                                ? "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
                                : "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                          }
                        >
                          <span className="mr-2 font-semibold text-slate-400">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          {option}
                          {correct ? (
                            <span className="ml-2 text-xs font-medium text-emerald-700">correct</span>
                          ) : null}
                          {chosen ? (
                            <span className="ml-2 text-xs font-medium">
                              {correct ? "your answer" : "your answer"}
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>

                  {question.explanation ? (
                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Explanation
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {question.explanation}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
                    {question.sourceRef ? <span>Source {question.sourceRef}</span> : null}
                    <span>Key: {question.keyStatus}</span>
                    {skipped ? <span>Not answered</span> : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
