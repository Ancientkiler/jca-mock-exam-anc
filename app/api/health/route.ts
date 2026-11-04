import { getDb } from "@/lib/db/client";
import { questions } from "@/lib/db/collections";
import { failure, json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const count = await (await questions()).countDocuments({ status: "published" });
    return json({ ok: true, questions: count });
  } catch (error) {
    console.error(error);
    return failure("Database unavailable", 503);
  }
}
