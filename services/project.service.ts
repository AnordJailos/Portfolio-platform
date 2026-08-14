/**
 * services/project.service.ts — all Project data access & mutation logic.
 * API routes and server components call these instead of using `prisma`
 * directly, so validation/side-effects (like re-indexing embeddings) stay
 * in one place.
 */
import { prisma } from "@/lib/prisma";
import { upsertEmbeddingsForSource } from "@/lib/embeddings";
import type { ProjectFormInput } from "@/lib/validations";
import type { ProjectStatus } from "@prisma/client";

export async function listPublishedProjects(filter?: { search?: string; tag?: string }) {
  return prisma.project.findMany({
    where: {
      status: "PUBLISHED",
      ...(filter?.tag ? { tags: { has: filter.tag } } : {}),
      ...(filter?.search
        ? {
            OR: [
              { title: { contains: filter.search, mode: "insensitive" } },
              { summary: { contains: filter.search, mode: "insensitive" } },
              { tags: { has: filter.search } },
            ],
          }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });
}

export async function listFeaturedProjects(limit = 3) {
  return prisma.project.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { order: "asc" },
    take: limit,
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({ where: { slug } });
}

export async function listAllProjectsForAdmin(status?: ProjectStatus) {
  return prisma.project.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export async function createProject(input: ProjectFormInput) {
  const project = await prisma.project.create({ data: input });
  if (project.status === "PUBLISHED") {
    await reindexProject(project.id);
  }
  return project;
}

export async function updateProject(id: string, input: ProjectFormInput) {
  const project = await prisma.project.update({ where: { id }, data: input });
  if (project.status === "PUBLISHED") {
    await reindexProject(project.id);
  } else {
    // No longer published — remove stale embeddings so the assistant stops citing it.
    await prisma.embedding.deleteMany({ where: { source: "PROJECT", sourceId: id } });
  }
  return project;
}

export async function deleteProject(id: string) {
  await prisma.embedding.deleteMany({ where: { source: "PROJECT", sourceId: id } });
  return prisma.project.delete({ where: { id } });
}

async function reindexProject(id: string) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  await upsertEmbeddingsForSource({
    source: "PROJECT",
    sourceId: project.id,
    title: project.title,
    content: `${project.title}\n${project.summary}\n${project.description}\nTags: ${project.tags.join(", ")}`,
    metadata: { slug: project.slug },
  });
}
