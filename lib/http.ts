import { NextResponse } from "next/server";

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function failure(message: string, status = 400): NextResponse {
  return json({ ok: false, error: message }, status);
}

export function serverFailure(error: unknown): NextResponse {
  console.error(error);
  return failure("Something went wrong. Please try again.", 500);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
