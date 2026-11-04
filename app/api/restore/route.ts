import { getApiUser } from "@/lib/auth/guards";
import { backupSchema, restoreUserData } from "@/lib/backup";
import { failure, json, serverFailure } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return failure("Authentication required", 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return failure("Invalid JSON body");
    }

    const parsed = backupSchema.safeParse(body);
    if (!parsed.success) {
      return failure(parsed.error.issues[0]?.message || "Invalid backup file", 422);
    }

    const result = await restoreUserData(user.id, parsed.data);
    return json({ ok: true, ...result });
  } catch (error) {
    return serverFailure(error);
  }
}
