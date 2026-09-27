import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { SITE_CONTENT_TAG } from "@/lib/cacheTags";

// «انشر الآن» in the internal app («الموقع» → لوحة الموقع) calls this with the
// shared secret (REVALIDATE_SECRET here = «مفتاح النشر» there). It drops every
// cached page and API response so the next visit refetches from the app —
// instead of waiting for the hourly ISR refresh.
function authorized(req: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret");
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag(SITE_CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
