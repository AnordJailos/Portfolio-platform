"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import type { Project } from "@prisma/client";
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

const STATUS_VARIANT = { DRAFT: "outline", PUBLISHED: "success", ARCHIVED: "danger" } as const;

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      toast.success("Project deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete that project");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button asChild size="sm">
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4" /> New project
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-foreground-faint">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {project.featured && <Star className="h-3.5 w-3.5 fill-signal-amber text-signal-amber" />}
                    <span className="font-medium text-foreground">{project.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
                </td>
                <td className="px-4 py-3 text-foreground-muted">{project.tags.slice(0, 3).join(", ")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/projects/${project.id}/edit`} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPendingDelete(project)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-state-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-foreground-faint">
                  No projects yet.
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
