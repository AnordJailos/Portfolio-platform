import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { experienceFormSchema } from "@/lib/validations";
import { createExperience } from "@/services/profile.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = experienceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid experience data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const experience = await createExperience(parsed.data);
  return NextResponse.json(experience, { status: 201 });
}
