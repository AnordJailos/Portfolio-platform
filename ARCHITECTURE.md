# Architecture

## Overview

This is a single Next.js application (no separate backend) using the App
Router for both pages and API routes. Server Components fetch data directly
via Prisma where possible; Client Components (`"use client"`) are reserved
for interactivity (forms, chat, the booking flow, admin tables).

```
Browser
  │
  ├─ Server Components (app/**/page.tsx) ── Prisma ──► Postgres (Supabase)
  │
  └─ Client Components ── fetch() ──► app/api/**/route.ts ── services/*.ts ── Prisma
                                                          └─ lib/openai.ts / lib/calendar.ts / lib/email.ts
```

`services/*.ts` is the one layer both API routes and (where convenient)
Server Components call into — it's where business rules live (e.g. "when a
project is published, re-index it for the assistant") so that logic can't
drift between two call sites.

## The RAG pipeline (AI assistant)

```
 visitor message
      │
      ▼
 lib/openai.ts → embed the message (text-embedding-3-small, 1536-dim)
      │
      ▼
 lib/embeddings.ts → similaritySearch() — pgvector cosine search (`<=>` operator)
      │                over the `embeddings` table, top 5 chunks above a
      │                0.72 similarity threshold
      ▼
 lib/rag.ts → buildSystemPrompt() — stitches the retrieved chunks into a
      │       system prompt instructing the model to answer as your "digital
      │       twin," grounded only in that context
      ▼
 OpenAI chat.completions.create({ stream: true }) — gpt-4o-mini by default
      │
      ▼
 app/api/chat/route.ts — tees the stream: one branch goes to the client as
      │                   it's generated, the other is buffered and, once
      │                   complete, persisted to `chat_messages` alongside
      │                   the sources used
      ▼
 components/chat/* — renders tokens as they arrive, then shows source
                      citations once the stream closes
```

### Why chunking and thresholds matter

- **Chunking** (`chunkText`, ~1200 characters with 150-character overlap):
  long project write-ups or blog posts are split so retrieval can surface the
  one paragraph that's actually relevant, not "here's the whole post."
- **Similarity threshold** (0.72): below this, a chunk is more likely noise
  than signal. If the assistant seems to be inventing answers, check
  whether irrelevant chunks are slipping through — raise the threshold. If
  it's too often saying "I don't have that information," lower it slightly
  or add more content to the knowledge base.

### What gets indexed, and when

| Source | Indexed when |
|---|---|
| `PROJECT` | A project is created/updated with `status: PUBLISHED` (auto) |
| `BLOG_POST` | Same, for blog posts |
| `BIO` | Only on manual "Sync knowledge base" (it's code, not a DB row) |
| `FAQ` | Same — lives in `lib/constants.ts` |
| `CUSTOM` | Immediately, when added via `/admin/knowledge-base` |

Unpublishing/deleting a project or post removes its embeddings in the same
service call (`services/project.service.ts` / `blog.service.ts`), so the
assistant never cites something that's no longer public.

## Database design notes

- **Why relational `ChatMessage` instead of a single JSON blob** (as the
  original brief's `ChatHistory` table sketch implied): storing one row per
  message makes it possible to query/paginate/analyze conversations properly,
  and keeps the `sources` JSON scoped to the one message it applies to. The
  session/message split mirrors how every production chat product models
  this.
- **`Embedding.vector` is `Unsupported("vector(1536)")`**: Prisma has no
  native pgvector type, so this column is invisible to the normal Prisma
  Client query API (it's silently excluded from `select`/`include`). All
  reads and writes touching the vector itself go through tagged-template raw
  SQL in `lib/embeddings.ts`, which parameterizes inputs safely — never
  string-concatenate user input into these queries if you extend them.
- **`AvailabilityRule` is separate from `Booking`**: recurring weekly
  availability (a rule) and individual booked slots (a fact) are different
  lifecycles — rules rarely change, bookings happen constantly. Keeping them
  separate also makes it trivial to compute "what's open" without mutating
  anything.
- **Soft content states via `status` enums** (`DRAFT`/`PUBLISHED`/`ARCHIVED`
  for projects, `DRAFT`/`PUBLISHED` for posts) rather than a boolean:
  leaves room for an archive/unpublish workflow without a schema change.

## Auth model

Single-tenant by design: one `User` table with a `role` (`ADMIN`/`EDITOR`),
credentials-based login (bcrypt-hashed password), JWT sessions via Auth.js
v5. `middleware.ts` gates `/admin/*` (except `/admin/login`) and mutation
methods on a few sensitive API routes at the edge; every admin-mutating
route handler also calls `requireAdminSession()` itself as defense in depth,
so a middleware misconfiguration alone can't expose a write endpoint.

## Booking + calendar sync

`services/booking.service.ts` computes availability by combining:
1. `AvailabilityRule` rows (your recurring weekly hours), and
2. live busy blocks from Google Calendar's `freebusy.query` (falling back to
   just checking your own `Booking` table if Google Calendar isn't
   configured yet, so the booking page still works during initial setup).

On confirmation, it best-effort creates a Google Calendar event with a Meet
link and emails the guest via Resend — either integration failing doesn't
block the booking itself (it's saved as `PENDING` and logged, not silently
dropped).

## Analytics

Two independent systems, both optional to actually use:
1. **First-party** (`AnalyticsEvent` table): every page view, project view,
   chat message, booking, and contact submission is logged via
   `POST /api/analytics`. This is what powers `/admin/analytics`'s charts —
   works with zero external services configured.
2. **PostHog** (optional, per the original brief): initialized client-side
   in `components/layout/analytics-provider.tsx` only if
   `NEXT_PUBLIC_POSTHOG_KEY` is set — for the site owner's own external
   product-analytics use, entirely separate from the admin dashboard.
