import { AdminHeader } from "@/components/admin/admin-header";
import { BlogForm } from "@/components/admin/blog-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <AdminHeader title="New post" description="Published posts are automatically indexed for the AI assistant." />
      <div className="p-6">
        <BlogForm />
      </div>
    </div>
  );
}
