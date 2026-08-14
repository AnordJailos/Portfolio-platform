"use client";

import { useMemo, useState } from "react";
import type { Project } from "@prisma/client";
import { ProjectCard } from "@/components/portfolio/project-card";
import { ProjectFilters } from "@/components/portfolio/project-filters";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tags))).sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.summary.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [projects, search, activeTag]);

  return (
    <div>
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        tags={allTags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-foreground-muted">
          No projects match "{search}"{activeTag ? ` in ${activeTag}` : ""}.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
