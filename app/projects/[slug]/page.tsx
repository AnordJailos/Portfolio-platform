import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { getProjectBySlug } from "@/services/project.service";
import { formatMonthYear } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectViewTracker } from "@/components/portfolio/project-view-tracker";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: project.coverImage ? { images: [{ url: project.coverImage }] } : undefined,
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || project.status !== "PUBLISHED") notFound();

  return (
    <div className="container max-w-3xl py-20">
      <ProjectViewTracker projectId={project.id} title={project.title} />

      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
      </Button>

      {project.coverImage && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg border border-border">
          <Image src={project.coverImage} alt={project.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground">{project.title}</h1>
      <p className="mt-3 text-lg text-foreground-muted">{project.summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground-faint">
        {project.role && <span>{project.role}</span>}
        {project.startDate && (
          <span className="font-mono text-xs">
            {formatMonthYear(project.startDate)}
            {project.endDate ? ` — ${formatMonthYear(project.endDate)}` : ""}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {project.liveUrl && (
          <Button asChild size="sm">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Live site
            </a>
          </Button>
        )}
        {project.githubUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" /> View code
            </a>
          </Button>
        )}
      </div>

      <div className="prose prose-invert mt-12 max-w-none prose-headings:font-display prose-a:text-signal-amber">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
      </div>

      {project.gallery.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {project.gallery.map((src, i) => (
            <div key={i} className="relative aspect-video overflow-hidden rounded-md border border-border">
              <Image src={src} alt={`${project.title} screenshot ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
