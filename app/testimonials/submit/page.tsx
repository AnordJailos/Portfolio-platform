import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import { TestimonialSubmissionForm } from "@/components/portfolio/testimonial-submission-form";

export const metadata: Metadata = { title: "Share your experience" };

export default function TestimonialSubmitPage() {
  return (
    <div className="container max-w-xl py-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl text-foreground">Share your experience</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Worked with {SITE.name}? A few honest words means a lot — and helps the next person decide to reach out.
        </p>
      </div>
      <TestimonialSubmissionForm />
    </div>
  );
}
