import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listFeaturedProjects } from "@/services/project.service";
import { ProjectCard } from "@/components/portfolio/project-card";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { Button } from "@/components/ui/button";

/** Server component — fetches directly, no client-side loading state needed. */
export async function FeaturedProjects() {
  const projects = await listFeaturedProjects(3);

  if (projects.length === 0) {
    return (
      <section className="container py-24">
        <SectionHeading eyebrow="Selected work" title="Featured projects" />
        <p className="mt-8 text-sm text-foreground-muted">
          No featured projects yet — mark a project as "Featured" in <code className="font-mono">/admin/projects</code> and it'll show up here.
        </p>
      </section>
    );
  }

  return (
    <section className="container py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Selected work" title="Featured projects" />
        <Button asChild variant="ghost" size="sm">
          <Link href="/projects">
            All projects <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
