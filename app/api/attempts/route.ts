import { getApiUser } from "@/lib/auth/guards";
import { createAttempt, BankError } from "@/lib/exam/service";
import { failure, json, serverFailure } from "@/lib/http";
import { parseBody } from "@/lib/validation/parse";
import { createAttemptSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return failure("Authentication required", 401);

    const parsed = await parseBody(request, createAttemptSchema);
    if (!parsed.ok) return parsed.response;

    const result = await createAttempt(user.id, parsed.data);
    return json({ ok: true, ...result }, 201);
  } catch (error) {
    if (error instanceof BankError) return failure(error.message, 409);
    return serverFailure(error);
  }
}
