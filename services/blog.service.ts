/**
 * services/blog.service.ts — BlogPost data access & mutation logic.
 */
import { prisma } from "@/lib/prisma";
import { upsertEmbeddingsForSource } from "@/lib/embeddings";
import { estimateReadingTime } from "@/lib/utils";
import type { BlogPostFormInput } from "@/lib/validations";
import type { PostStatus } from "@prisma/client";

export async function listPublishedPosts(filter?: { search?: string; category?: string; tag?: string }) {
  return prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(filter?.category ? { category: filter.category } : {}),
      ...(filter?.tag ? { tags: { has: filter.tag } } : {}),
      ...(filter?.search
        ? {
            OR: [
              { title: { contains: filter.search, mode: "insensitive" } },
              { excerpt: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { publishedDate: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function listAllPostsForAdmin(status?: PostStatus) {
  return prisma.blogPost.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export async function createPost(input: BlogPostFormInput) {
  const post = await prisma.blogPost.create({
    data: {
      ...input,
      readingTimeMin: estimateReadingTime(input.content),
      publishedDate: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
  if (post.status === "PUBLISHED") await reindexPost(post.id);
  return post;
}

export async function updatePost(id: string, input: BlogPostFormInput) {
  const existing = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...input,
      readingTimeMin: estimateReadingTime(input.content),
      publishedDate: existing.publishedDate ?? (input.status === "PUBLISHED" ? new Date() : null),
    },
  });
  if (post.status === "PUBLISHED") {
    await reindexPost(post.id);
  } else {
    await prisma.embedding.deleteMany({ where: { source: "BLOG_POST", sourceId: id } });
  }
  return post;
}

export async function deletePost(id: string) {
  await prisma.embedding.deleteMany({ where: { source: "BLOG_POST", sourceId: id } });
  return prisma.blogPost.delete({ where: { id } });
}

async function reindexPost(id: string) {
  const post = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
  await upsertEmbeddingsForSource({
    source: "BLOG_POST",
    sourceId: post.id,
    title: post.title,
    content: `${post.title}\n${post.excerpt}\n${post.content}`,
    metadata: { slug: post.slug },
  });
}
