"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export function TestimonialsTable({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/testimonials/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Testimonial deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete that testimonial");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  async function togglePublished(t: Testimonial) {
    setTogglingId(t.id);
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !t.published }),
      });
      if (!res.ok) throw new Error();
      toast.success(t.published ? "Unpublished" : "Published — now visible on the site");
      router.refresh();
    } catch {
      toast.error("Couldn't update that testimonial");
    } finally {
      setTogglingId(null);
    }
  }

  const pendingCount = testimonials.filter((t) => !t.published && t.source === "VISITOR").length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          {pendingCount > 0 ? (
            <span className="text-signal-amber">{pendingCount} pending your review</span>
          ) : (
            "All caught up — nothing pending review."
          )}
        </p>
        <Button asChild size="sm">
          <Link href="/admin/testimonials/new">
            <Plus className="h-4 w-4" /> New testimonial
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-foreground-faint">
            <tr>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Quote</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      {t.avatar && <AvatarImage src={t.avatar} alt={t.authorName} />}
                      <AvatarFallback className="text-xs">{t.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{t.authorName}</p>
                      <p className="text-xs text-foreground-faint">{[t.authorRole, t.company].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-xs px-4 py-3 text-foreground-muted">
                  <p className="line-clamp-2">"{t.quote}"</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={t.source === "VISITOR" ? "amber" : "outline"}>{t.source === "VISITOR" ? "Visitor" : "You"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Switch checked={t.published} disabled={togglingId === t.id} onCheckedChange={() => togglePublished(t)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/testimonials/${t.id}/edit`} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPendingDelete(t)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-state-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-foreground-faint">
                  No testimonials yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{pendingDelete?.authorName}"'s testimonial?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
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
