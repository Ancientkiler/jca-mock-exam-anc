import { listUserSummaries } from "@/lib/admin/analytics";
import { getApiUser } from "@/lib/auth/guards";
import { failure, json, serverFailure } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) return failure("Authentication required", 401);
    if (user.role !== "admin") return failure("Forbidden", 403);

    return json({ ok: true, users: await listUserSummaries() });
  } catch (error) {
    return serverFailure(error);
  }
}
