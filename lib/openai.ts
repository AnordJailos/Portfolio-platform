/**
 * lib/openai.ts — AI provider client.
 * ----------------------------------------------------------------------------
 * Fully on Groq now — both chat completions and embeddings, one API key, $0.
 * (Filename kept as "openai.ts" only for import-path stability across the
 * rest of the codebase; nothing here actually talks to OpenAI anymore.)
 *
 * Groq's embeddings model (nomic-embed-text-v1_5) outputs 768-dim vectors,
 * different from what OpenAI's text-embedding-3-small produced (1536) — see
 * prisma/schema.prisma's `vector(768)` and migration 0003_groq_embeddings.
 *
 * Client is created lazily (not at module top level) — see lib/email.ts's
 * comment for why: Next.js imports every route during build/cold-start, and
 * a missing key would otherwise crash on import rather than on actual use.
 * ----------------------------------------------------------------------------
 */
import OpenAI from "openai";

let groqClient: OpenAI | null = null;
export function getGroq(): OpenAI {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.");
    }
    groqClient = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
  }
  return groqClient;
}

export const CHAT_MODEL = process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile";
export const EMBEDDING_MODEL = process.env.GROQ_EMBEDDING_MODEL ?? "nomic-embed-text-v1_5";
export const EMBEDDING_DIMENSIONS = 768; // must match prisma/schema.prisma `vector(768)`

/** Embed a single string. Returns a plain number[] ready for pgvector. */
export async function embedText(text: string): Promise<number[]> {
  const response = await getGroq().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, " ").trim(),
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error("Groq returned no embedding");
  return embedding;
}

/** Embed many strings in one request. */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await getGroq().embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.replace(/\n/g, " ").trim()),
  });
  return response.data.map((d) => d.embedding);
}
