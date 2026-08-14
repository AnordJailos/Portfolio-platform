import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import type { Project } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-signal-amber/40 hover:-translate-y-1">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-raised">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-glass-sheen">
              <span className="font-display text-2xl text-foreground-faint">{project.title[0]}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-medium leading-snug text-foreground">{project.title}</h3>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-foreground-faint transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal-amber" />
          </div>
          <p className="text-sm leading-relaxed text-foreground-muted line-clamp-2">{project.summary}</p>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {project.githubUrl && <Github className="ml-auto h-3.5 w-3.5 text-foreground-faint" />}
          </div>
        </div>
      </Card>
    </Link>
  );
}
