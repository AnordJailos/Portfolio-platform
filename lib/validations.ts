/**
 * lib/validations.ts — single source of truth for input validation.
 * Shared between React Hook Form (client) and API route handlers (server)
 * so validation logic never drifts between the two.
 */
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(100),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().max(150).optional(),
  message: z.string().min(10, "Message should be at least 10 characters").max(5000),
  // Honeypot field — real users never fill this in; bots often do.
  company: z.string().max(0, "Spam detected").optional(),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const bookingFormSchema = z.object({
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email(),
  topic: z.string().max(150).optional(),
  notes: z.string().max(2000).optional(),
  date: z.string().datetime({ message: "Invalid date/time" }),
  durationMinutes: z.union([z.literal(15), z.literal(30), z.literal(60)]),
  timezone: z.string().default("UTC"),
});
export type BookingFormInput = z.infer<typeof bookingFormSchema>;

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(50),
});

export const projectFormSchema = z.object({
  title: z.string().min(2).max(150),
  slug: z
    .string()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  summary: z.string().min(10).max(300),
  description: z.string().min(20),
  coverImage: z.string().url().optional().or(z.literal("")),
  gallery: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  role: z.string().max(150).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  order: z.number().int().default(0),
});
export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export const blogPostFormSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(20),
  coverImage: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});
export type BlogPostFormInput = z.infer<typeof blogPostFormSchema>;

export const knowledgeEntryFormSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(10),
  source: z.enum(["FAQ", "CUSTOM"]).default("CUSTOM"),
});
