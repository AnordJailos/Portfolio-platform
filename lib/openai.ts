/**
 * lib/openai.ts — AI provider clients.
 * ----------------------------------------------------------------------------
 * Split across two free providers, chosen after verifying live model
 * availability rather than guessing:
 *
 *  - Chat generation → Groq (`openai/gpt-oss-120b`). Verified against
 *    GET https://api.groq.com/openai/v1/models on this account — Groq
 *    deprecated the earlier llama-3.3-70b-versatile default without much
 *    notice, so if you ever see a 404 "model does not exist" again, that
 *    endpoint is the fastest way to see what's actually live before
 *    guessing a replacement name.
 *  - Embeddings → Google Gemini (`gemini-embedding-001`), truncated to 768
 *    dimensions via Matryoshka Representation Learning support — chosen
 *    specifically to match the existing `vector(768)` column so this
 *    switch needs zero database migration. Groq has no embeddings model on
 *    this account (confirmed via the same /models check), so this isn't a
 *    "keep OpenAI as a fallback" situation — Gemini is the actual free
 *    replacement. Called via plain REST (fetch), not a dedicated Google SDK,
 *    to avoid adding a new dependency for two simple endpoints.
 *
 * Both clients/keys are resolved lazily (inside functions, not at module
 * top level) — see the comment in lib/email.ts for why: Next.js imports
 * every route during build/cold-start, and a missing key would otherwise
 * crash on import rather than on the specific request that needed it.
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

export const CHAT_MODEL = process.env.GROQ_CHAT_MODEL ?? "openai/gpt-oss-120b";
export const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768; // must match prisma/schema.prisma `vector(768)` — unchanged, no migration needed

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set.");
  return key;
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Embed a single string via Gemini's embedContent endpoint. */
export async function embedText(text: string): Promise<number[]> {
  const key = getGeminiApiKey();
  const res = await fetch(`${GEMINI_BASE}/models/${EMBEDDING_MODEL}:embedContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text: text.replace(/\n/g, " ").trim() }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini embedding request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values)) throw new Error("Gemini returned no embedding");
  return values;
}

/** Embed many strings via Gemini's batchEmbedContents endpoint. */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const key = getGeminiApiKey();

  const res = await fetch(`${GEMINI_BASE}/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: texts.map((t) => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text: t.replace(/\n/g, " ").trim() }] },
        outputDimensionality: EMBEDDING_DIMENSIONS,
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini batch embedding request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const embeddings = data?.embeddings;
  if (!Array.isArray(embeddings)) throw new Error("Gemini returned no embeddings");
  return embeddings.map((e: { values: number[] }) => e.values);
}
