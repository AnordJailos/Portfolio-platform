import { notFound } from "next/navigation";
import { getPostBySlug } from "@/services/blog.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { BlogForm } from "@/components/admin/blog-form";

type Params = { params: Promise<{ slug: string }> };

export default async function EditBlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div>
      <AdminHeader title={`Edit — ${post.title}`} />
      <div className="p-6">
        <BlogForm post={post} />
      </div>
    </div>
  );
}
