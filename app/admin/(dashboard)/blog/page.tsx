import { listAllPostsForAdmin } from "@/services/blog.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { BlogTable } from "@/components/admin/blog-table";

export default async function AdminBlogPage() {
  const posts = await listAllPostsForAdmin();

  return (
    <div>
      <AdminHeader title="Blog" description="Manage your posts." />
      <div className="p-6">
        <BlogTable posts={posts} />
      </div>
    </div>
  );
}
