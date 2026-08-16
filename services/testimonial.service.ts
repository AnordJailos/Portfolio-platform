/**
 * services/testimonial.service.ts
 * ----------------------------------------------------------------------------
 * Testimonials have two authors: you (via /admin/testimonials, published
 * immediately) and site visitors (via /testimonials/submit, saved as
 * unpublished + source: VISITOR until you approve them). Both paths end up
 * as rows in the same table — the admin table just shows a "Pending" badge
 * for anything not yet published.
 * ----------------------------------------------------------------------------
 */
import { prisma } from "@/lib/prisma";
import { sendTestimonialNotification } from "@/lib/email";
import type { TestimonialFormInput, TestimonialSubmissionInput } from "@/lib/validations";

export async function listPublishedTestimonials() {
  return prisma.testimonial.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}

export async function listAllTestimonialsForAdmin() {
  return prisma.testimonial.findMany({ orderBy: [{ published: "asc" }, { createdAt: "desc" }] });
}

export async function getTestimonial(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

/** Admin-authored testimonial — created via /admin/testimonials/new, publish state under your control. */
export async function createTestimonialAsAdmin(input: TestimonialFormInput) {
  return prisma.testimonial.create({
    data: {
      authorName: input.authorName,
      authorRole: input.authorRole || null,
      company: input.company || null,
      quote: input.quote,
      avatar: input.avatar || null,
      email: input.email || null,
      order: input.order,
      published: input.published,
      source: "ADMIN",
    },
  });
}

export async function updateTestimonial(id: string, input: TestimonialFormInput) {
  return prisma.testimonial.update({
    where: { id },
    data: {
      authorName: input.authorName,
      authorRole: input.authorRole || null,
      company: input.company || null,
      quote: input.quote,
      avatar: input.avatar || null,
      email: input.email || null,
      order: input.order,
      published: input.published,
    },
  });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

export async function setTestimonialPublished(id: string, published: boolean) {
  return prisma.testimonial.update({ where: { id }, data: { published } });
}

/**
 * Visitor submission — always created unpublished, regardless of what the
 * client sends, so nothing reaches the public site without your review.
 */
export async function submitTestimonialFromVisitor(input: TestimonialSubmissionInput) {
  const testimonial = await prisma.testimonial.create({
    data: {
      authorName: input.authorName,
      authorRole: input.authorRole || null,
      company: input.company || null,
      quote: input.quote,
      avatar: input.avatar || null,
      email: input.email || null,
      source: "VISITOR",
      published: false,
    },
  });

  await prisma.analyticsEvent.create({ data: { type: "CONTACT_SUBMITTED", metadata: { kind: "testimonial" } } }).catch(() => {});

  try {
    await sendTestimonialNotification({ authorName: input.authorName, quote: input.quote, email: input.email });
  } catch (err) {
    console.error("Testimonial notification email failed to send.", err);
  }

  return testimonial;
}
