/**
 * lib/openai.ts — AI provider clients.
 * ----------------------------------------------------------------------------
 * Hybrid setup, chosen for cost:
 *  - Chat generation → Groq (OpenAI-compatible endpoint, free tier).
 *  - Embeddings → OpenAI (text-embedding-3-small, 1536-dim, matches the
 *    pgvector column — Groq's embedding model uses a different dimension).
 *
 * Both clients are created LAZILY (inside a getter, not at module top level).
 * The `openai` SDK throws synchronously if its resolved API key is empty —
 * if that happens at module-import time (which Next.js does for every route
 * during build AND on cold start in production), it crashes before any of
 * our own error handling ever runs. Lazy init means a missing/misconfigured
 * key only fails the specific request that needed it, with a real error
 * message, instead of taking down everything that merely imports this file.
 * ----------------------------------------------------------------------------
 */
import OpenAI from "openai";

let groqClient: OpenAI | null = null;
export function getGroq(): OpenAI {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set — cannot reach the chat model.");
    }
    groqClient = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
  }
  return groqClient;
}

let openaiClient: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set — cannot generate embeddings.");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export const CHAT_MODEL = process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile";
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536; // must match prisma/schema.prisma `vector(1536)`

/** Embed a single string. Returns a plain number[] ready for pgvector. */
export async function embedText(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, " ").trim(),
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error("OpenAI returned no embedding");
  return embedding;
}

/** Embed many strings in one request (OpenAI supports batched input). */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.replace(/\n/g, " ").trim()),
  });
  return response.data.map((d) => d.embedding);
}
