import { AdminHeader } from "@/components/admin/admin-header";
import { KnowledgeBaseManager } from "@/components/admin/knowledge-base-manager";

export default function AdminKnowledgeBasePage() {
  return (
    <div>
      <AdminHeader title="Knowledge Base" description="What your AI assistant is grounded in." />
      <div className="p-6">
        <KnowledgeBaseManager />
      </div>
    </div>
  );
}
