import { listContactMessagesForAdmin } from "@/services/contact.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { MessagesTable } from "@/components/admin/messages-table";

export default async function AdminMessagesPage() {
  const messages = await listContactMessagesForAdmin();

  return (
    <div>
      <AdminHeader title="Messages" description="Submissions from your contact form." />
      <div className="p-6">
        <MessagesTable messages={messages} />
      </div>
    </div>
  );
}
