"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { BlogPost } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/portfolio/blog-card";

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter(Boolean))) as string[],
    [posts]
  );

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchesSearch =
          !search ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !activeCategory || p.category === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    [posts, search, activeCategory]
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="pl-9"
            aria-label="Search blog posts"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory(null)}>
            <Badge variant={activeCategory === null ? "amber" : "outline"} className="cursor-pointer">
              All
            </Badge>
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}>
              <Badge variant={activeCategory === cat ? "amber" : "outline"} className="cursor-pointer">
                {cat}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-foreground-muted">No posts match your search.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
