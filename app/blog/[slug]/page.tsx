import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { getPostBySlug } from "@/services/blog.service";
import { formatFullDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: post.coverImage ? { images: [{ url: post.coverImage }] } : undefined,
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") notFound();

  return (
    <article className="container max-w-2xl py-20">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
      </Button>

      {post.category && <Badge>{post.category}</Badge>}
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground">{post.title}</h1>

      <div className="mt-4 flex items-center gap-4 font-mono text-xs text-foreground-faint">
        {post.publishedDate && (
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {formatFullDate(post.publishedDate)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {post.readingTimeMin} min read
        </span>
      </div>

      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg border border-border">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-a:text-signal-amber">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
