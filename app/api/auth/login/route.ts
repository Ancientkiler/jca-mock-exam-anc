import { verifyPassword } from "@/lib/auth/password";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/auth/token";
import { users } from "@/lib/db/collections";
import { cookieSecure } from "@/lib/env";
import { clientIp, failure, json, serverFailure } from "@/lib/http";
import { parseBody } from "@/lib/validation/parse";
import { loginSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = await parseBody(request, loginSchema);
    if (!parsed.ok) return parsed.response;

    const username = parsed.data.username.toLowerCase();
    const rateKey = `${clientIp(request)}:${username}`;

    if (await isLoginBlocked(rateKey)) {
      return failure("Too many login attempts. Try again in 15 minutes.", 429);
    }

    const user = await (await users()).findOne({ username });
    const valid =
      user && user.active
        ? await verifyPassword(parsed.data.password, user.passwordHash)
        : false;

    if (!user || !valid) {
      await recordLoginFailure(rateKey);
      return failure("Invalid username or password", 401);
    }

    await clearLoginFailures(rateKey);
    await (await users()).updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } },
    );

    const token = await createSessionToken({
      sub: user._id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    });

    const response = json({
      ok: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure(),
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return serverFailure(error);
  }
}
