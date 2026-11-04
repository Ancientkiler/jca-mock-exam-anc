import { getApiUser } from "@/lib/auth/guards";
import { resetUserData } from "@/lib/backup";
import { failure, json, serverFailure } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getApiUser();
    if (!user) return failure("Authentication required", 401);

    await resetUserData(user.id);
    return json({ ok: true });
  } catch (error) {
    return serverFailure(error);
  }
}
