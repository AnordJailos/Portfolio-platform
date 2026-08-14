import { listAllProjectsForAdmin } from "@/services/project.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProjectsTable } from "@/components/admin/projects-table";

export default async function AdminProjectsPage() {
  const projects = await listAllProjectsForAdmin();

  return (
    <div>
      <AdminHeader title="Projects" description="Manage your portfolio's case studies." />
      <div className="p-6">
        <ProjectsTable projects={projects} />
      </div>
    </div>
  );
}
