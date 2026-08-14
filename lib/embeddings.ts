/**
 * lib/embeddings.ts
 * ----------------------------------------------------------------------------
 * Everything needed to keep the `embeddings` table in sync with the site's
 * real content, and to run cosine-similarity search against it.
 *
 * Prisma can't type-check the `vector` column (see schema.prisma), so writes
 * and the similarity search both drop down to tagged-template raw SQL.
 * $executeRaw / $queryRaw parameterize values safely — do not string-concat
 * user input into these queries.
 * ----------------------------------------------------------------------------
 */
import { prisma } from "@/lib/prisma";
import { embedBatch } from "@/lib/openai";
import type { EmbeddingSource } from "@prisma/client";

const CHUNK_SIZE = 1200; // characters per chunk — small enough for precise retrieval, large enough for context
const CHUNK_OVERLAP = 150;

/** Split long content into overlapping chunks so retrieval can surface a precise passage rather than a whole document. */
export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

/** Converts a JS number[] into the pgvector text literal format: '[0.1,0.2,...]' */
function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

/**
 * Replace all embeddings for a given (source, sourceId) with freshly
 * generated ones. Call this whenever a Project or BlogPost is created,
 * updated, or the FAQ/bio content in lib/constants.ts changes.
 */
export async function upsertEmbeddingsForSource(params: {
  source: EmbeddingSource;
  sourceId: string | null;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const { source, sourceId, title, content, metadata } = params;

  // Clear out any previous chunks for this source before re-indexing.
  if (sourceId) {
    await prisma.embedding.deleteMany({ where: { source, sourceId } });
  }

  const chunks = chunkText(content);
  const vectors = await embedBatch(chunks);

  for (let i = 0; i < chunks.length; i++) {
    const id = `emb_${source}_${sourceId ?? "static"}_${i}_${Date.now()}`;
    const vectorLiteral = toVectorLiteral(vectors[i]!);
    await prisma.$executeRaw`
      INSERT INTO "embeddings" ("id", "content", "vector", "source", "sourceId", "title", "metadata", "createdAt", "updatedAt")
      VALUES (${id}, ${chunks[i]}, ${vectorLiteral}::vector, ${source}::"EmbeddingSource", ${sourceId}, ${title}, ${metadata ? JSON.stringify(metadata) : null}::jsonb, now(), now())
    `;
  }

  return { chunksIndexed: chunks.length };
}

export type RetrievedChunk = {
  id: string;
  content: string;
  title: string | null;
  source: EmbeddingSource;
  sourceId: string | null;
  similarity: number;
};

/**
 * Cosine-similarity search over the embeddings table.
 * pgvector's `<=>` operator returns cosine *distance* (0 = identical), so we
 * convert to a similarity score (1 = identical) for readability downstream.
 */
export async function similaritySearch(queryVector: number[], topK = 5): Promise<RetrievedChunk[]> {
  const vectorLiteral = toVectorLiteral(queryVector);

  const rows = await prisma.$queryRaw<
    { id: string; content: string; title: string | null; source: EmbeddingSource; sourceId: string | null; distance: number }[]
  >`
    SELECT "id", "content", "title", "source", "sourceId",
           "vector" <=> ${vectorLiteral}::vector AS distance
    FROM "embeddings"
    ORDER BY distance ASC
    LIMIT ${topK}
  `;

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    title: r.title,
    source: r.source,
    sourceId: r.sourceId,
    similarity: 1 - r.distance,
  }));
}

/** Full re-index of everything the AI assistant should know about. Called from /api/embeddings (admin-only). */
export async function syncKnowledgeBase() {
  const { FAQS, SITE } = await import("@/lib/constants");
  let totalChunks = 0;

  // Bio
  const bioResult = await upsertEmbeddingsForSource({
    source: "BIO",
    sourceId: "bio",
    title: `${SITE.name} — Bio`,
    content: `${SITE.shortBio}\n\n${SITE.longBio}`,
  });
  totalChunks += bioResult.chunksIndexed;

  // FAQs — one embedding entry per Q&A pair keeps retrieval precise
  for (const [i, faq] of FAQS.entries()) {
    const result = await upsertEmbeddingsForSource({
      source: "FAQ",
      sourceId: `faq_${i}`,
      title: faq.question,
      content: `Q: ${faq.question}\nA: ${faq.answer}`,
    });
    totalChunks += result.chunksIndexed;
  }

  // Published projects
  const projects = await prisma.project.findMany({ where: { status: "PUBLISHED" } });
  for (const project of projects) {
    const result = await upsertEmbeddingsForSource({
      source: "PROJECT",
      sourceId: project.id,
      title: project.title,
      content: `${project.title}\n${project.summary}\n${project.description}\nTags: ${project.tags.join(", ")}`,
      metadata: { slug: project.slug },
    });
    totalChunks += result.chunksIndexed;
  }

  // Published blog posts
  const posts = await prisma.blogPost.findMany({ where: { status: "PUBLISHED" } });
  for (const post of posts) {
    const result = await upsertEmbeddingsForSource({
      source: "BLOG_POST",
      sourceId: post.id,
      title: post.title,
      content: `${post.title}\n${post.excerpt}\n${post.content}`,
      metadata: { slug: post.slug },
    });
    totalChunks += result.chunksIndexed;
  }

  return {
    sourcesIndexed: 2 + FAQS.length + projects.length + posts.length,
    totalChunks,
  };
}
