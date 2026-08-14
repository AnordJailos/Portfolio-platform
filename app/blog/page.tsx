import type { Metadata } from "next";
import { listPublishedPosts } from "@/services/blog.service";
import { BlogGrid } from "@/components/portfolio/blog-grid";
import { SectionHeading } from "@/components/portfolio/section-heading";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await listPublishedPosts();

  return (
    <div className="container py-20">
      <SectionHeading eyebrow="Writing" title="Blog" />
      <div className="mt-10">
        <BlogGrid posts={posts} />
      </div>
    </div>
  );
}
