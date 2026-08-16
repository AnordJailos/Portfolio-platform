import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { educationFormSchema } from "@/lib/validations";
import { createEducation } from "@/services/profile.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = educationFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid education data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const education = await createEducation(parsed.data);
  return NextResponse.json(education, { status: 201 });
}
