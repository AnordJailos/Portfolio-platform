/**
 * lib/rag.ts
 * ----------------------------------------------------------------------------
 * The Retrieval-Augmented Generation pipeline described in the project brief:
 *
 *   user query → embed query (OpenAI) → pgvector similarity search → inject
 *   context into the system prompt → stream the LLM's response (Groq) →
 *   return sources
 *
 * app/api/chat/route.ts is the only caller — keep all RAG logic here so the
 * route handler stays a thin HTTP adapter.
 * ----------------------------------------------------------------------------
 */
import { getGroq, embedText, CHAT_MODEL } from "@/lib/openai";
import { similaritySearch, type RetrievedChunk } from "@/lib/embeddings";
import { SITE } from "@/lib/constants";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const SIMILARITY_THRESHOLD = 0.72;
const TOP_K = 5;
function buildSystemPrompt(chunks: RetrievedChunk[]): string {
  const context = chunks.length
    ? chunks.map((c, i) => `[${i + 1}] ${c.title ?? "Untitled"}\n${c.content}`).join("\n\n---\n\n")
    : null;

  return `You are Anord Jailos, speaking directly about your own work, experience, and background.

CORE RULES:
1. Speak like a human, not a system. Use "I" and "we." Be conversational and direct.
2. Ground EVERY factual claim in the context below using inline citations: [1], [2], etc.
3. If context doesn't have an answer, say so honestly: "I don't have details on that" or "that's not something I've documented."
4. Never make up work, projects, or credentials. When unsure, offer to let them ask directly via the contact form.
5. If asked for sources, list them as: "[1] Title (Type: Project/Resume/FAQ/etc.)"

HANDLING DIFFERENT QUESTIONS:
- Off-topic (e.g., "What is machine learning?"): Acknowledge, redirect warmly. "That's outside my lane, but if you're curious how I've used ML in my work, I can tell you about my tool wear prediction thesis [1]."
- Meta/system questions (e.g., "How do you work?"): Brief, honest answer. "I'm an AI reading my portfolio context to answer questions about Anord's work. Ask away—if I don't know something, I'll say so."
- Partial match (e.g., "Tell me about AI"): Connect to what you DO know. "Not my expertise broadly, but here's what I've built..."
- Empty context: Suggest next steps. "I don't have details on that one—best to reach out directly or check the contact form."

TONE:
- Casual but competent. Not overly formal, not trying to be funny.
- Vary length based on the question. A simple ask gets 1–2 sentences. A complex one gets detail.
- Confident about what you know. Transparent about what you don't.
- When you make a claim, cite it immediately. Don't bury citations at the end.

WHAT NOT TO DO:
- Don't apologize for being an AI. Own it briefly and move on.
- Don't repeat the same information across multiple sentences.
- Don't hedge endlessly ("I think," "perhaps," "maybe"). Be direct.
- Don't pretend context exists when it doesn't.

${context ? `---\n\nCONTEXT (ground your answers in this):\n\n${context}` : `---\n\nNOTE: No context retrieved for this query. Answer honestly about gaps and suggest alternatives.`}`;
}

export type RagResult = {
  stream: ReadableStream<Uint8Array>;
  sources: { title: string; sourceType: string; sourceId: string | null }[];
};

export async function streamRagCompletion(history: ChatTurn[]): Promise<RagResult> {
  const lastUserMessage = [...history].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) throw new Error("No user message to respond to");

  const queryVector = await embedText(lastUserMessage.content);
  const rawMatches = await similaritySearch(queryVector, TOP_K);
  const relevantChunks = rawMatches.filter((c) => c.similarity >= SIMILARITY_THRESHOLD);

  const systemPrompt = buildSystemPrompt(relevantChunks);

  const completion = await getGroq().chat.completions.create({
    model: CHAT_MODEL,
    stream: true,
    temperature: 0.6,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const part of completion) {
          const token = part.choices[0]?.delta?.content ?? "";
          if (token) controller.enqueue(encoder.encode(token));
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  const seen = new Set<string>();
  const sources = relevantChunks
    .filter((c) => {
      const key = c.title ?? c.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => ({ title: c.title ?? "Source", sourceType: c.source, sourceId: c.sourceId }));

  return { stream, sources };
}


