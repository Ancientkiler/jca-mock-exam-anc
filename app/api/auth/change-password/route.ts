import { getApiUser } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { users } from "@/lib/db/collections";
import { failure, json, serverFailure } from "@/lib/http";
import { parseBody } from "@/lib/validation/parse";
import { changePasswordSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const current = await getApiUser();
    if (!current) return failure("Authentication required", 401);

    const parsed = await parseBody(request, changePasswordSchema);
    if (!parsed.ok) return parsed.response;

    const user = await (await users()).findOne({ _id: current.id });
    if (!user) return failure("Account not found", 404);

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return failure("Current password is incorrect", 401);

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await (await users()).updateOne({ _id: user._id }, { $set: { passwordHash } });

    return json({ ok: true });
  } catch (error) {
    return serverFailure(error);
  }
}
