import { getApiUser } from "@/lib/auth/guards";
import { exportUserData } from "@/lib/backup";
import { failure, json, serverFailure } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) return failure("Authentication required", 401);

    const data = await exportUserData(user.id, user.username);
    return json(data, 200);
  } catch (error) {
    return serverFailure(error);
  }
}
