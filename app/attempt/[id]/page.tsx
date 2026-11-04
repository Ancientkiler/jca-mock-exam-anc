import { notFound, redirect } from "next/navigation";
import { AttemptRunner } from "@/components/attempt-runner";
import { requireUser } from "@/lib/auth/guards";
import { getAttemptForUser } from "@/lib/exam/service";

export const dynamic = "force-dynamic";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const view = await getAttemptForUser(id, user.id);
  if (!view) notFound();
  if (view.attempt.status === "submitted") redirect(`/result/${id}`);

  return (
    <AttemptRunner
      attemptId={view.attempt._id}
      title={view.test.title}
      endsAt={view.attempt.endsAt.toISOString()}
      durationSec={view.test.durationSec}
      questions={view.questions.map((question) => ({
        id: question._id,
        sectionId: question.sectionId,
        topic: question.topic,
        difficulty: question.difficulty,
        stem: question.stem,
        options: question.options,
      }))}
      initialAnswers={view.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        markedForReview: answer.markedForReview,
        timeSpentMs: answer.timeSpentMs,
      }))}
    />
  );
}
