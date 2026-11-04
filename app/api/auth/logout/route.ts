import type { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/token";
import { cookieSecure } from "@/lib/env";
import { json } from "@/lib/http";

export async function POST(): Promise<NextResponse> {
  const response = json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: 0,
  });
  return response;
}
