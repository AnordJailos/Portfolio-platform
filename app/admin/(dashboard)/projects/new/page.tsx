import { AdminHeader } from "@/components/admin/admin-header";
import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <AdminHeader title="New project" description="This is automatically added to the AI assistant's knowledge base once published." />
      <div className="p-6">
        <ProjectForm />
      </div>
    </div>
  );
}
