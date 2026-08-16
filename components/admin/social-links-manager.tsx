"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { SocialLink } from "@prisma/client";
import { socialLinkFormSchema, type SocialLinkFormInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export function SocialLinksManager({ links }: { links: SocialLink[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SocialLink | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SocialLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/social-links/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Link removed");
      router.refresh();
    } catch {
      toast.error("Couldn't remove that link");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add link
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-foreground-faint">
            <tr>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium capitalize text-foreground">{link.platform}</td>
                <td className="max-w-xs truncate px-4 py-3 text-foreground-muted">{link.url}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(link)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPendingDelete(link)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-state-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-foreground-faint">
                  No social links yet — add the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SocialLinkFormDialog link={editing === "new" ? undefined : editing ?? undefined} open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove "{pendingDelete?.platform}"?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Removing…" : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SocialLinkFormDialog({
  link,
  open,
  onOpenChange,
}: {
  link?: SocialLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEditing = Boolean(link);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SocialLinkFormInput>({
    values: link ? { platform: link.platform, url: link.url, order: link.order } : { platform: "", url: "", order: 0 },
  });

  async function onSubmit(data: SocialLinkFormInput) {
    const parsed = socialLinkFormSchema.safeParse({ ...data, order: Number(data.order) });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    try {
      const res = await fetch(isEditing ? `/api/social-links/${link!.id}` : "/api/social-links", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Link updated" : "Link added");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit link" : "Add link"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-platform">Platform</Label>
            <Input id="link-platform" placeholder="github" {...register("platform")} />
            {errors.platform && <p className="text-xs text-state-danger">{errors.platform.message}</p>}
            <p className="text-xs text-foreground-faint">
              Use "github", "linkedin", "twitter", or "youtube" to get a matching icon in the footer — anything else falls back to a generic mail icon.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-url">URL</Label>
            <Input id="link-url" placeholder="https://github.com/AnordJailos" {...register("url")} />
            {errors.url && <p className="text-xs text-state-danger">{errors.url.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-order">Order</Label>
            <Input id="link-order" type="number" className="max-w-[120px]" {...register("order", { valueAsNumber: true })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Add link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
