import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { blogPostFormSchema } from "@/lib/validations";
import { getPostBySlug, updatePost, deletePost } from "@/services/blog.service";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = blogPostFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const post = await updatePost(existing.id, parsed.data);
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deletePost(existing.id);
  return NextResponse.json({ ok: true });
}
