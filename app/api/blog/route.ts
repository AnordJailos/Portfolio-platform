import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { blogPostFormSchema } from "@/lib/validations";
import { listPublishedPosts, listAllPostsForAdmin, createPost } from "@/services/blog.service";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  if (searchParams.get("admin") === "1") {
    try {
      await requireAdminSession();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const status = searchParams.get("status") as "DRAFT" | "PUBLISHED" | null;
    const posts = await listAllPostsForAdmin(status ?? undefined);
    return NextResponse.json({ posts });
  }

  const posts = await listPublishedPosts({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = blogPostFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existingSlug = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "That slug is already taken" }, { status: 409 });
  }

  const post = await createPost(parsed.data);
  return NextResponse.json(post, { status: 201 });
}
