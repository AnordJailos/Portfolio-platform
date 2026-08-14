import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock } from "lucide-react";
import type { BlogPost } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMonthYear } from "@/lib/utils";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-signal-violet/40 hover:-translate-y-1">
        {post.coverImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-raised">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {post.category && <Badge>{post.category}</Badge>}
          <h3 className="font-display text-lg font-medium leading-snug text-foreground">{post.title}</h3>
          <p className="text-sm leading-relaxed text-foreground-muted line-clamp-3">{post.excerpt}</p>
          <div className="mt-auto flex items-center gap-4 pt-3 font-mono text-xs text-foreground-faint">
            {post.publishedDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> {formatMonthYear(post.publishedDate)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.readingTimeMin} min read
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
