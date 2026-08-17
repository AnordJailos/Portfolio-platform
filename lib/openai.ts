/**
 * lib/openai.ts — AI provider clients.
 * ----------------------------------------------------------------------------
 * Hybrid setup, chosen for cost:
 *  - Chat generation → Groq. Groq's API is OpenAI-compatible (same request/
 *    response shape), so we just point the official `openai` SDK at Groq's
 *    base URL instead of pulling in a separate SDK. Groq's free tier has no
 *    credit-card requirement and no token budget — it's gated by per-minute
 *    rate limits only, which is more than enough for a personal site.
 *  - Embeddings → still OpenAI (text-embedding-3-small). Groq's embeddings
 *    endpoint (nomic-embed-text-v1.5) exists but outputs 768-dim vectors,
 *    not OpenAI's 1536 — switching would mean a schema migration and a full
 *    knowledge-base re-index. Not worth it: embeddings are the cheap part of
 *    a RAG pipeline (a fraction of a cent per chat message); chat generation
 *    is the part that actually costs money, and that's now free.
 * ----------------------------------------------------------------------------
 */
import OpenAI from "openai";

/** Chat completions — Groq, OpenAI-compatible endpoint. */
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/** Embeddings only — real OpenAI, kept because Groq's embedding model uses a different vector size. */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const CHAT_MODEL = process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile";
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536; // must match prisma/schema.prisma `vector(1536)` — unchanged, still OpenAI

/** Embed a single string. Returns a plain number[] ready for pgvector. */
export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
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
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.replace(/\n/g, " ").trim()),
  });
  return response.data.map((d) => d.embedding);
}
