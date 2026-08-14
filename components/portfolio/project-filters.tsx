"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProjectFilters({
  search,
  onSearchChange,
  tags,
  activeTag,
  onTagChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-faint" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects…"
          className="pl-9"
          aria-label="Search projects"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onTagChange(null)}>
          <Badge variant={activeTag === null ? "amber" : "outline"} className={cn("cursor-pointer")}>
            All
          </Badge>
        </button>
        {tags.map((tag) => (
          <button key={tag} onClick={() => onTagChange(tag)}>
            <Badge variant={activeTag === tag ? "amber" : "outline"} className="cursor-pointer">
              {tag}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
