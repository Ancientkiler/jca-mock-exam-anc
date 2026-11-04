import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { failure } from "@/lib/http";

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: failure("Invalid JSON body") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      response: failure(first?.message || "Invalid request", 422),
    };
  }
  return { ok: true, data: parsed.data };
}
