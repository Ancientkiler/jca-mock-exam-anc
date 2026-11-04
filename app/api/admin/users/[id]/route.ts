import { getUserPerformance } from "@/lib/admin/analytics";
import { getApiUser } from "@/lib/auth/guards";
import { failure, json, serverFailure } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiUser();
    if (!user) return failure("Authentication required", 401);
    if (user.role !== "admin") return failure("Forbidden", 403);

    const { id } = await context.params;
    const performance = await getUserPerformance(id);
    if (!performance) return failure("User not found", 404);

    return json({ ok: true, performance });
  } catch (error) {
    return serverFailure(error);
  }
}
