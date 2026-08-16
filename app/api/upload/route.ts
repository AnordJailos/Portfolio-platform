import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";

export const runtime = "nodejs";

/** Admin-only image upload — cover images for projects/posts/testimonials created from the dashboard. */
export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const folder = typeof formData?.get("folder") === "string" ? (formData.get("folder") as string) : "uploads";
  const result = await uploadImage(file, folder);

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
