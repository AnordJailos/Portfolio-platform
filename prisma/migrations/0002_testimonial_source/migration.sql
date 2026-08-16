-- ============================================================================
-- Migration: 0002_testimonial_source
-- Adds visitor-submission support to testimonials: a private follow-up email
-- and a source flag (ADMIN vs VISITOR) so the admin dashboard can tell the
-- two apart. Additive only — safe to run against your existing database.
-- ============================================================================

CREATE TYPE "TestimonialSource" AS ENUM ('ADMIN', 'VISITOR');

ALTER TABLE "testimonials" ADD COLUMN "email" TEXT;
ALTER TABLE "testimonials" ADD COLUMN "source" "TestimonialSource" NOT NULL DEFAULT 'ADMIN';
