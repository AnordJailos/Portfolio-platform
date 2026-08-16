import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { skillFormSchema } from "@/lib/validations";
import { createSkill } from "@/services/profile.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = skillFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid skill data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const skill = await createSkill(parsed.data);
  return NextResponse.json(skill, { status: 201 });
}
