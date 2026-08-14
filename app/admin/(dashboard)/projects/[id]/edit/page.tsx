import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProjectForm } from "@/components/admin/project-form";

type Params = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Params) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <AdminHeader title={`Edit — ${project.title}`} />
      <div className="p-6">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
