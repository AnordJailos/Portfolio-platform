import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { testimonialFormSchema } from "@/lib/validations";
import { updateTestimonial, deleteTestimonial, setTestimonialPublished } from "@/services/testimonial.service";

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
  const parsed = testimonialFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid testimonial data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateTestimonial(id, parsed.data));
  } catch {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
}

/** PATCH — quick publish/unpublish toggle from the admin table, without opening the full edit form. */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.published !== "boolean") {
    return NextResponse.json({ error: "Expected { published: boolean }" }, { status: 400 });
  }

  try {
    return NextResponse.json(await setTestimonialPublished(id, body.published));
  } catch {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
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
    await deleteTestimonial(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
}
