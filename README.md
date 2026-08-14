# AI Portfolio Platform

A production-grade personal portfolio: brand site, project showcase, blog, an
AI "digital twin" assistant (RAG over your real content), a booking system
with Google Calendar sync, and a full admin CMS — built with Next.js 15,
TypeScript, Tailwind, Prisma, Supabase (Postgres + pgvector + storage), and
the OpenAI API.

**New here?** Read `SETUP_GUIDE.docx` first — it's the non-technical,
step-by-step walkthrough for getting every service (Supabase, OpenAI, Resend,
Google Calendar, PostHog) connected. This README is the technical reference.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS + a small custom design-token layer (see `tailwind.config.ts`) |
| UI primitives | Radix UI, styled in the shadcn/ui convention (`components/ui/`) |
| Animation | Framer Motion |
| Database | PostgreSQL via Supabase, accessed with Prisma ORM |
| Vector search | pgvector, queried via Prisma raw SQL (`lib/embeddings.ts`) |
| AI | OpenAI (chat completions + `text-embedding-3-small`) |
| Auth | Auth.js (NextAuth) v5, credentials provider, JWT sessions |
| Email | Resend |
| Calendar | Google Calendar API (server-to-server, one refresh token) |
| Analytics | First-party event table (powers `/admin/analytics`) + optional PostHog |
| Deployment | Vercel |

## Project structure

```
app/                      Next.js App Router pages + API routes
  (public pages)           /, /about, /projects, /blog, /assistant, /booking, /contact
  admin/login/             standalone login (no dashboard chrome)
  admin/(dashboard)/       route group — everything behind the sidebar
  api/                     route handlers (see API Reference below)
components/
  ui/                      unstyled-ish primitives (button, card, dialog, ...)
  layout/                  navbar, footer, theme + analytics providers
  portfolio/               hero, project/blog cards & grids, timeline, etc.
  chat/                    the AI assistant widget
  booking/                 calendar, time slots, booking form
  admin/                   dashboard tables, forms, KB manager, charts
lib/                       Prisma client, auth config, OpenAI/RAG, validation, email, calendar
services/                  business logic between API routes and Prisma
hooks/                     client-side data hooks (chat, bookings, image upload)
prisma/                    schema.prisma, seed.ts, migrations/
types/                     shared TypeScript types
```

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in real values (see SETUP_GUIDE.docx)
cp .env.example .env

# 3. Push the schema to your database
#    (either works — see note below)
npx prisma migrate dev --name init
# or, if you'd rather apply the hand-authored migration directly:
#   psql "$DIRECT_URL" -f prisma/migrations/0001_init/migration.sql

# 4. Seed placeholder content + your first admin login
npm run db:seed

# 5. Run the dev server
npm run dev
```

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin/login`
for the dashboard (credentials printed by the seed script — change the
password immediately).

> **Note on migrations:** `prisma/migrations/0001_init/migration.sql` was
> hand-authored to match `schema.prisma` exactly, since it was written in an
> environment without a live database connection to run `prisma migrate dev`
> against. Running `prisma migrate dev` fresh against your own database
> works identically and is the recommended path — Prisma will detect the
> schema already matches (via the existing migration) or generate an
> equivalent one.

## Key workflows

- **Add a project / blog post**: `/admin/projects` or `/admin/blog`. Publishing
  automatically re-embeds the content for the AI assistant.
- **Edit your bio/FAQs**: these live in code (`lib/constants.ts`), not the
  database, since they're closer to "site copy" than "content." After
  editing, click **Sync knowledge base** on `/admin/knowledge-base`.
- **Add a one-off fact for the assistant**: `/admin/knowledge-base` → "Add a
  custom knowledge entry" — no code change needed.
- **Change availability**: `AvailabilityRule` rows (seeded Mon–Fri, 9–5 UTC).
  There's no admin UI for this yet — edit via `npx prisma studio` or extend
  `/admin/bookings` with a small settings form.

## API reference

All routes live under `app/api/`. Public routes have no auth requirement;
admin routes require a signed-in ADMIN/EDITOR session (enforced by
`middleware.ts` and, redundantly, inside each handler via
`requireAdminSession()`).

| Route | Methods | Notes |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | Auth.js internals |
| `/api/chat` | GET, POST | GET rehydrates history by `sessionId`; POST streams a RAG response |
| `/api/embeddings` | GET, POST, DELETE | Knowledge-base summary / sync / add / remove (admin) |
| `/api/projects` | GET, POST | Public list (published only) or `?admin=1` for all statuses |
| `/api/projects/[id]` | GET, PUT, DELETE | Admin |
| `/api/blog` | GET, POST | Same pattern as projects |
| `/api/blog/[slug]` | GET, PUT, DELETE | Admin (except GET) |
| `/api/bookings` | GET, POST | POST is public (visitors book); GET is admin |
| `/api/bookings/[id]` | DELETE | Cancel (admin) |
| `/api/bookings/availability` | GET | Public — `?date=&duration=` |
| `/api/contact` | POST | Public, rate-limited, honeypot field |
| `/api/contact/[id]` | PATCH, DELETE | Admin |
| `/api/upload` | POST | Admin — multipart image upload to Supabase Storage |
| `/api/analytics` | GET, POST | GET is admin summary; POST is public event logging |

## Testing your setup

- **Chat not answering with real info?** Run "Sync knowledge base" in
  `/admin/knowledge-base` after adding content — nothing is embedded until
  you do.
- **Booking page shows no slots?** Check `AvailabilityRule` rows exist
  (seeded by default) and, if Google Calendar isn't connected yet, the
  booking service falls back to checking only your own `Booking` table.
- **Images not uploading?** Confirm the `portfolio-assets` bucket exists in
  Supabase Storage and is public, and `SUPABASE_SERVICE_ROLE_KEY` is set.

## License

This codebase is yours to use for your own personal site. No license
restrictions imposed by this template.
