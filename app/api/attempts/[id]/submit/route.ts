import { getApiUser } from "@/lib/auth/guards";
import { submitAttempt } from "@/lib/exam/service";
import { failure, json, serverFailure } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiUser();
    if (!user) return failure("Authentication required", 401);

    const { id } = await context.params;
    const attempt = await submitAttempt(id, user.id);
    if (!attempt) return failure("Attempt not found", 404);

    return json({ ok: true, score: attempt.score, status: attempt.status });
  } catch (error) {
    return serverFailure(error);
  }
}
