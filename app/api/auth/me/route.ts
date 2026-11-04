import { getApiUser } from "@/lib/auth/guards";
import { failure, json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getApiUser();
  if (!user) return failure("Authentication required", 401);
  return json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
}
