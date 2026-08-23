-- ============================================================================
-- Migration: 0003_groq_embeddings
-- Switches the embeddings column from 1536-dim (OpenAI text-embedding-3-small)
-- to 768-dim (Groq nomic-embed-text-v1_5). Vectors from the two models are
-- not compatible with each other, so this clears the table — it's a
-- regenerable search index, not real content. Run "Sync knowledge base" in
-- /admin/knowledge-base right after this migration to rebuild it.
-- ============================================================================

DELETE FROM "embeddings";

DROP INDEX IF EXISTS "embeddings_vector_idx";
ALTER TABLE "embeddings" DROP COLUMN "vector";
ALTER TABLE "embeddings" ADD COLUMN "vector" vector(768) NOT NULL;

CREATE INDEX IF NOT EXISTS "embeddings_vector_idx" ON "embeddings"
  USING ivfflat ("vector" vector_cosine_ops) WITH (lists = 100);
