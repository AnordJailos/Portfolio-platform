import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { socialLinkFormSchema } from "@/lib/validations";
import { createSocialLink } from "@/services/profile.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = socialLinkFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid social link data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const link = await createSocialLink(parsed.data);
  return NextResponse.json(link, { status: 201 });
}
