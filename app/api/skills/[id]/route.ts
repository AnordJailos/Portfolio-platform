import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { skillFormSchema } from "@/lib/validations";
import { updateSkill, deleteSkill } from "@/services/profile.service";

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
  const parsed = skillFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid skill data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  try {
    return NextResponse.json(await updateSkill(id, parsed.data));
  } catch {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
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
    await deleteSkill(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }
}
