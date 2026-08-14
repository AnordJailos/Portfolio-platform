import type { Metadata } from "next";
import { listPublishedProjects } from "@/services/project.service";
import { ProjectGrid } from "@/components/portfolio/project-grid";
import { SectionHeading } from "@/components/portfolio/section-heading";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await listPublishedProjects();

  return (
    <div className="container py-20">
      <SectionHeading eyebrow="Selected work" title="Projects" />
      <div className="mt-10">
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
