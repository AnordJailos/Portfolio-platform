import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testimonialFormSchema, testimonialSubmissionSchema } from "@/lib/validations";
import { listAllTestimonialsForAdmin, createTestimonialAsAdmin, submitTestimonialFromVisitor } from "@/services/testimonial.service";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** GET — admin only: every testimonial, published and pending alike. */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const testimonials = await listAllTestimonialsForAdmin();
  return NextResponse.json({ testimonials });
}

/**
 * POST — dual-purpose, branching on whether the caller is signed in:
 *  - Signed in (you, from /admin/testimonials/new): full control over
 *    publish state and ordering, via testimonialFormSchema.
 *  - Not signed in (a visitor, from /testimonials/submit): narrower fields,
 *    rate-limited, always saved unpublished pending your review.
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (session?.user) {
    const body = await req.json().catch(() => null);
    const parsed = testimonialFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid testimonial data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const testimonial = await createTestimonialAsAdmin(parsed.data);
    return NextResponse.json(testimonial, { status: 201 });
  }

  const { ok } = rateLimit(`testimonial-submit:${getClientKey(req)}`, 3, 60_000 * 10); // 3 per 10 minutes/IP
  if (!ok) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = testimonialSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Honeypot caught something — pretend success so bots don't learn to skip it.
  if (parsed.data.company_website) {
    return NextResponse.json({ ok: true });
  }

  const testimonial = await submitTestimonialFromVisitor(parsed.data);
  return NextResponse.json({ ok: true, id: testimonial.id }, { status: 201 });
}
