import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/upload";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Public — lets a site visitor attach an optional photo to a testimonial
 * submission without signing in. Deliberately narrow: fixed "testimonials"
 * folder (can't write anywhere else in the bucket), same size/type rules as
 * the admin upload, and rate-limited since it's unauthenticated.
 */
export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`testimonial-upload:${getClientKey(req)}`, 5, 60_000 * 10); // 5 per 10 minutes/IP
  if (!ok) {
    return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const result = await uploadImage(file, "testimonials");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
