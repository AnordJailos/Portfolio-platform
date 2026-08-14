"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { BlogPost } from "@prisma/client";
import { formatMonthYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export function BlogTable({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blog/${pendingDelete.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      toast.success("Post deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete that post");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button asChild size="sm">
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" /> New post
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-foreground-faint">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-foreground">{post.title}</td>
                <td className="px-4 py-3">
                  <Badge variant={post.status === "PUBLISHED" ? "success" : "outline"}>{post.status}</Badge>
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {post.publishedDate ? formatMonthYear(post.publishedDate) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/blog/${post.slug}/edit`} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPendingDelete(post)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-state-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-foreground-faint">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{pendingDelete?.title}"?</DialogTitle>
            <DialogDescription>
              This also removes it from the AI assistant's knowledge base. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
