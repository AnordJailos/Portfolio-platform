import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { socialLinkFormSchema } from "@/lib/validations";
import { updateSocialLink, deleteSocialLink } from "@/services/profile.service";

export const runtime = "nodejs";
type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = socialLinkFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid social link data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  try {
    return NextResponse.json(await updateSocialLink(id, parsed.data));
  } catch {
    return NextResponse.json({ error: "Social link not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await deleteSocialLink(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Social link not found" }, { status: 404 });
  }
}
