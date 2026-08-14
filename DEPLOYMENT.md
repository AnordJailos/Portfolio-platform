# Deployment (Vercel)

This assumes Supabase (database + storage) is already set up per
`SETUP_GUIDE.docx` §§1–2, and you've run the app successfully on
`localhost` at least once.

## 1. Push to a Git repository

Vercel deploys from Git. If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
2. Framework preset: **Next.js** (auto-detected).
3. Build command / output directory: leave as default (`next build`).
4. **Before the first deploy**, add every variable from `.env.example` under
   **Settings → Environment Variables**, with real values:
   - Use the **pooled** Supabase connection string for `DATABASE_URL` and the
     **direct** one for `DIRECT_URL` (Vercel's serverless functions need
     connection pooling; migrations need the direct connection).
   - Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your real production
     URL (e.g. `https://yourname.com`), not `localhost`.
   - Generate a fresh `AUTH_SECRET` for production — don't reuse your local
     one: `openssl rand -base64 32`.

## 3. Run migrations against the production database

From your local machine, pointed at the production `DIRECT_URL`:

```bash
DATABASE_URL="<production-direct-url>" npx prisma migrate deploy
```

(`migrate deploy` applies existing migrations without generating new ones or
prompting — the right command for CI/production, as opposed to `migrate dev`
which is for local development.)

## 4. Seed production (optional, first deploy only)

If you want the placeholder content in production too (usually you don't —
better to seed once locally, replace content via `/admin`, and skip seeding
prod), run:

```bash
DATABASE_URL="<production-direct-url>" npm run db:seed
```

Otherwise, just create your admin user directly via a one-off script or SQL
insert with a bcrypt hash.

## 5. Deploy

Push to `main` (or click **Deploy** in the Vercel dashboard). Vercel runs
`npm install` → `prisma generate` (via the `postinstall` script) → `next build`.

## 6. Post-deploy checklist

- [ ] Visit `/admin/login` and sign in with your real admin account.
- [ ] Replace every TODO in the seeded content (`lib/constants.ts` values
      require a redeploy since they're compiled in; DB content — projects,
      posts, bio-adjacent tables — can be edited live from `/admin`).
- [ ] Click **Sync knowledge base** on `/admin/knowledge-base` once your real
      content is in place.
- [ ] Test the booking flow end-to-end (confirms Google Calendar +
      Resend are both wired correctly).
- [ ] Test the contact form (confirms Resend + `EMAIL_TO_ADMIN`).
- [ ] If using a custom domain, add it under **Settings → Domains** in
      Vercel, then update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to match
      and redeploy.

## Notes on runtimes

Most API routes declare `export const runtime = "nodejs"` because they use
Prisma and/or the OpenAI SDK, neither of which run on the Edge runtime.
`middleware.ts` is Edge-compatible by design (it only reads the session JWT
cookie, no Prisma import) — don't add Node-only imports to it.
