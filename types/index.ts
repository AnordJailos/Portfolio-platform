/**
 * types/index.ts — shared domain types.
 * Prisma already generates types for DB models (import from "@prisma/client");
 * these are the additional shapes used for API payloads, chat state, and
 * component props that don't map 1:1 to a table.
 */
import type { Project, BlogPost, Booking, ChatMessage as DbChatMessage } from "@prisma/client";

export type { Project, BlogPost, Booking };

export type ChatSource = {
  title: string;
  sourceType: string;
  sourceId: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  createdAt: string;
};

export type PersistedChatMessage = DbChatMessage;

export type TimeSlot = {
  iso: string; // ISO datetime string, UTC
  label: string; // human-readable, in the visitor's chosen timezone
};

export type ProjectFilter = {
  search: string;
  tags: string[];
};

export type AnalyticsSummary = {
  totalPageViews: number;
  totalProjectViews: number;
  totalChatSessions: number;
  totalBookings: number;
  topProjects: { title: string; views: number }[];
  viewsByDay: { date: string; views: number }[];
};

export type ApiError = { error: string; fieldErrors?: Record<string, string[]> };
