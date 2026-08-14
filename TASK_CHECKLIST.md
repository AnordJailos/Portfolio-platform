# Build Checklist — AI Portfolio Platform

Legend: [ ] pending · [~] in progress · [x] done

## 1. Project Foundation
- [x] Directory structure
- [x] package.json + dependency list
- [x] tsconfig.json
- [x] next.config.mjs
- [x] tailwind.config.ts + design tokens
- [x] postcss.config.js
- [x] .eslintrc.json
- [x] components.json (shadcn conventions)
- [x] .gitignore
- [x] .env.example (every variable, documented)

## 2. Database Layer
- [x] prisma/schema.prisma (full data model)
- [x] prisma/seed.ts (sample content so the site isn't empty on first run)
- [x] prisma/migrations/0001_init/migration.sql (hand-authored initial migration)

## 3. Core Library (lib/)
- [x] lib/prisma.ts — Prisma client singleton
- [x] lib/utils.ts — cn() + shared helpers
- [x] lib/constants.ts — site/profile config (YOUR CONTENT GOES HERE)
- [x] lib/auth.ts — NextAuth (Auth.js) config, credentials + role gate
- [x] lib/supabase.ts — Supabase client (storage + pgvector access)
- [x] lib/openai.ts — OpenAI client wrapper
- [x] lib/embeddings.ts — embedding generation + pgvector similarity search
- [x] lib/rag.ts — retrieval-augmented generation pipeline
- [x] lib/validations.ts — zod schemas for all forms/APIs
- [x] lib/email.ts — Resend transactional email
- [x] lib/calendar.ts — Google Calendar availability + event creation
- [x] lib/rate-limit.ts — basic in-memory + upstash-ready rate limiter

## 4. Types
- [x] types/index.ts — shared domain types

## 5. Services (services/)
- [x] project.service.ts
- [x] blog.service.ts
- [x] booking.service.ts
- [x] chat.service.ts
- [x] contact.service.ts

## 6. UI Primitives (components/ui/)
- [x] button, card, input, textarea, label, badge
- [x] dialog, tabs, select, avatar, separator
- [x] skeleton, toaster (sonner-based), sheet, switch

## 7. Layout (components/layout/)
- [x] navbar.tsx
- [x] footer.tsx
- [x] theme-provider.tsx
- [x] page-transition.tsx

## 8. Portfolio Components (components/portfolio/)
- [x] signal-waveform.tsx (signature motif)
- [x] hero-section.tsx
- [x] featured-projects.tsx
- [x] skills-section.tsx
- [x] timeline.tsx
- [x] testimonials-section.tsx
- [x] ai-assistant-preview.tsx
- [x] contact-form.tsx
- [x] project-card.tsx + project-grid.tsx + project-filters.tsx
- [x] blog-card.tsx + blog-grid.tsx

## 9. Chat / AI Assistant (components/chat/)
- [x] chat-window.tsx
- [x] chat-message.tsx
- [x] chat-input.tsx
- [x] suggested-prompts.tsx
- [x] typing-indicator.tsx
- [x] source-citation.tsx
- [x] hooks/use-chat.ts (session persistence + streaming)

## 10. Booking (components/booking/)
- [x] booking-calendar.tsx
- [x] time-slot-picker.tsx
- [x] booking-form.tsx
- [x] booking-confirmation.tsx
- [x] hooks/use-bookings.ts (availability + submission)

## 11. Admin (components/admin/)
- [x] admin-sidebar.tsx + admin-header.tsx
- [x] projects-table.tsx + project-form.tsx
- [x] blog-table.tsx + blog-form.tsx
- [x] bookings-table.tsx
- [x] knowledge-base-manager.tsx
- [x] analytics-dashboard.tsx
- [x] hooks/use-image-upload.ts

## 12. Pages (app/)
- [x] layout.tsx + globals.css + loading/error/not-found
- [x] page.tsx (Home)
- [x] about/page.tsx
- [x] projects/page.tsx + projects/[slug]/page.tsx
- [x] blog/page.tsx + blog/[slug]/page.tsx
- [x] assistant/page.tsx
- [x] booking/page.tsx
- [x] contact/page.tsx
- [x] admin/login/page.tsx (outside the dashboard route group — no sidebar)
- [x] admin/(dashboard)/* — dashboard, projects, blog, bookings, knowledge-base, analytics, messages

## 13. API Routes (app/api/)
- [x] auth/[...nextauth]/route.ts
- [x] chat/route.ts (streaming RAG)
- [x] embeddings/route.ts
- [x] projects/route.ts + projects/[id]/route.ts
- [x] blog/route.ts + blog/[slug]/route.ts
- [x] bookings/route.ts + bookings/availability/route.ts + bookings/[id]/route.ts
- [x] contact/route.ts
- [x] upload/route.ts
- [x] analytics/route.ts
- [x] middleware.ts (admin route protection)
- [x] components/layout/analytics-provider.tsx (page-view tracking + optional PostHog)
- [x] contact/[id]/route.ts (mark read / delete — supports admin/messages)

## 14. Documentation & Handoff
- [x] README.md
- [x] ARCHITECTURE.md
- [x] DEPLOYMENT.md
- [x] SETUP_GUIDE.docx (step-by-step, non-technical friendly)
- [x] Final packaging (.zip) + present to user

---
**Status: Build complete.** 137 files, ~7,100 lines of application code across
the full stack described in the brief — see README.md for what to do next.

## Re-verification pass (linkage audit)
Ran after initial build to confirm everything is actually wired together, not just present:
- [x] All 306 `@/` internal imports resolve to a real file
- [x] All named imports match a real export in their source file (checked 382; 8 flagged were false positives from destructured `const` exports / inline `type` modifiers — manually confirmed correct)
- [x] Every `fetch()` call to `/api/*` matches a real route file + exported HTTP method
- [x] Every `<Link href>` / `router.push()` target matches a real page route (25 checked)
- [x] Every `prisma.<model>.<method>()` field usage matches `schema.prisma` (2 flagged were false positives — a code comment and a JSON `metadata` key — confirmed correct)
- [x] Every `process.env.*` reference (including `schema.prisma`'s `env()`) is documented in `.env.example`, and vice versa
- [x] Fixed: `NEXT_PUBLIC_SITE_NAME` was documented but unused — now wired as a fallback in `lib/constants.ts`
- [x] Fixed: added `trustHost: true` to `lib/auth.ts` — required for Auth.js v5 behind Vercel's proxy
- [x] All dynamic route params (`[id]`, `[slug]`) consistent across folder name, `Promise<{...}>` type, and destructuring
- [x] Admin sidebar links, `middleware.ts` matcher, and the `(dashboard)` route group folders all agree
