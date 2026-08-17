import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { syncKnowledgeBase, upsertEmbeddingsForSource } from "@/lib/embeddings";
import { knowledgeEntryFormSchema } from "@/lib/validations";

export const runtime = 60;

/** GET — summary of what's indexed, grouped by source, plus the manually-added entries. */
export async function GET() {
  const [counts, manual] = await Promise.all([
    prisma.embedding.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.embedding.findMany({
      where: { source: { in: ["CUSTOM", "FAQ"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const countsMap = Object.fromEntries(counts.map((c) => [c.source, c._count._all]));
  const totalChunks = counts.reduce((sum, c) => sum + c._count._all, 0);

  return NextResponse.json({
    counts: countsMap,
    totalChunks,
    manualEntries: manual.map((m) => ({
      id: m.id,
      title: m.title ?? "Untitled",
      source: m.source,
      contentPreview: m.content.slice(0, 160),
    })),
  });
}

const syncActionSchema = z.object({ action: z.literal("sync") });

/** POST — either { action: "sync" } to re-index everything, or a new manual knowledge entry. */
export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const syncParsed = syncActionSchema.safeParse(body);
  if (syncParsed.success) {
    const result = await syncKnowledgeBase();
    return NextResponse.json(result);
  }

  const entryParsed = knowledgeEntryFormSchema.safeParse(body);
  if (!entryParsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { title, content, source } = entryParsed.data;
  const sourceId = `manual_${Date.now()}`;
  await upsertEmbeddingsForSource({ source, sourceId, title, content });

  return NextResponse.json({ ok: true });
}

/** DELETE — remove a single manual entry (and any of its chunks) by id. */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const entry = await prisma.embedding.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove every chunk that shares the same sourceId (a manual entry may have been split into several).
  await prisma.embedding.deleteMany({ where: { source: entry.source, sourceId: entry.sourceId } });

  return NextResponse.json({ ok: true });
}
