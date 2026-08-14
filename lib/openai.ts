/**
 * AI wrapper
 * Groq handles chat.
 * OpenAI handles embeddings.
 */

import OpenAI from "openai";
import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export const CHAT_MODEL =
  process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile";


export const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";


export const EMBEDDING_DIMENSIONS = 1536;


/**
 * Create embedding for one text.
 */
export async function embedText(
  text: string
): Promise<number[]> {

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, " ").trim(),
  });


  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error("Embedding generation failed");
  }

  return embedding;
}


/**
 * Create embeddings for multiple texts.
 */
export async function embedBatch(
  texts: string[]
): Promise<number[][]> {

  if (texts.length === 0) return [];


  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map(
      (t) => t.replace(/\n/g, " ").trim()
    ),
  });


  return response.data.map(
    (item) => item.embedding
  );
}