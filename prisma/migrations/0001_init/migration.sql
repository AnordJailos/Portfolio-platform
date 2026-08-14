-- ============================================================================
-- Migration: 0001_init
-- Hand-authored to mirror `npx prisma migrate dev --name init`.
-- Run this AFTER you've set DATABASE_URL / DIRECT_URL, OR just run
-- `npx prisma migrate dev` locally and let Prisma generate+apply it fresh —
-- either path produces the same schema. See SETUP_GUIDE.docx §4.
-- ============================================================================

-- Extensions -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums --------------------------------------------------------------------
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "EmbeddingSource" AS ENUM ('PROJECT', 'BLOG_POST', 'BIO', 'FAQ', 'RESUME', 'CUSTOM');
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'PROJECT_VIEW', 'CHAT_MESSAGE', 'BOOKING_CREATED', 'CONTACT_SUBMITTED');

-- users ----------------------------------------------------------------------
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "passwordHash" TEXT,
  "role" "Role" NOT NULL DEFAULT 'EDITOR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- accounts (NextAuth) ---------------------------------------------------------
CREATE TABLE "accounts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- sessions (NextAuth) -----------------------------------------------------
CREATE TABLE "sessions" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- verification_tokens (NextAuth) -------------------------------------------
CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- projects -----------------------------------------------------------------
CREATE TABLE "projects" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "coverImage" TEXT,
  "gallery" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "role" TEXT,
  "githubUrl" TEXT,
  "liveUrl" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
  "order" INTEGER NOT NULL DEFAULT 0,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
CREATE INDEX "projects_status_featured_idx" ON "projects"("status", "featured");
CREATE INDEX "projects_slug_idx" ON "projects"("slug");

-- blog_posts -----------------------------------------------------------------
CREATE TABLE "blog_posts" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "coverImage" TEXT,
  "category" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
  "readingTimeMin" INTEGER NOT NULL DEFAULT 5,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "publishedDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE INDEX "blog_posts_status_publishedDate_idx" ON "blog_posts"("status", "publishedDate");
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- skills / experience / education / achievements / testimonials / social ---
CREATE TABLE "skills" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 3,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "experience" (
  "id" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "location" TEXT,
  "description" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "education" (
  "id" TEXT NOT NULL,
  "institution" TEXT NOT NULL,
  "degree" TEXT NOT NULL,
  "field" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "achievements" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "date" TIMESTAMP(3),
  "url" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "testimonials" (
  "id" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorRole" TEXT,
  "company" TEXT,
  "avatar" TEXT,
  "quote" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "social_links" (
  "id" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- embeddings (pgvector) ------------------------------------------------------
CREATE TABLE "embeddings" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "vector" vector(1536) NOT NULL,
  "source" "EmbeddingSource" NOT NULL,
  "sourceId" TEXT,
  "title" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "embeddings_source_idx" ON "embeddings"("source");
-- Approximate nearest-neighbour index for cosine similarity search.
-- IVFFlat needs data in the table before it's useful; safe to create empty.
CREATE INDEX IF NOT EXISTS "embeddings_vector_idx" ON "embeddings"
  USING ivfflat ("vector" vector_cosine_ops) WITH (lists = 100);

-- chat_sessions / chat_messages ----------------------------------------------
CREATE TABLE "chat_sessions" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "visitorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "chat_sessions_sessionId_key" ON "chat_sessions"("sessionId");

CREATE TABLE "chat_messages" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "role" "MessageRole" NOT NULL,
  "content" TEXT NOT NULL,
  "sources" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- bookings / availability_rules ----------------------------------------------
CREATE TABLE "bookings" (
  "id" TEXT NOT NULL,
  "guestName" TEXT NOT NULL,
  "guestEmail" TEXT NOT NULL,
  "topic" TEXT,
  "notes" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "calendarEventId" TEXT,
  "meetingLink" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "bookings_date_idx" ON "bookings"("date");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

CREATE TABLE "availability_rules" (
  "id" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- contact_messages / analytics_events -----------------------------------------
CREATE TABLE "contact_messages" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analytics_events" (
  "id" TEXT NOT NULL,
  "type" "AnalyticsEventType" NOT NULL,
  "path" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "analytics_events_type_createdAt_idx" ON "analytics_events"("type", "createdAt");
