import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { experienceFormSchema } from "@/lib/validations";
import { updateExperience, deleteExperience } from "@/services/profile.service";

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
  const parsed = experienceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid experience data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  try {
    return NextResponse.json(await updateExperience(id, parsed.data));
  } catch {
    return NextResponse.json({ error: "Experience entry not found" }, { status: 404 });
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
    await deleteExperience(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Experience entry not found" }, { status: 404 });
  }
}
