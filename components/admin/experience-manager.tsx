"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Experience } from "@prisma/client";
import { experienceFormSchema, type ExperienceFormInput } from "@/lib/validations";
import { formatMonthYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

/** `Date | null` -> "yyyy-MM-dd" for <input type="date">, or "" if absent. */
function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ExperienceManager({ items }: { items: Experience[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/experience/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Entry removed");
      router.refresh();
    } catch {
      toast.error("Couldn't remove that entry");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add role
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                {item.role} · {item.company}
              </p>
              <p className="font-mono text-xs text-foreground-faint">
                {formatMonthYear(item.startDate)} — {item.isCurrent ? "Present" : item.endDate ? formatMonthYear(item.endDate) : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditing(item)} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setPendingDelete(item)} aria-label="Delete">
                <Trash2 className="h-4 w-4 text-state-danger" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-foreground-faint">
            No experience entries yet — add the first one above.
          </p>
        )}
      </div>

      <ExperienceFormDialog
        item={editing === "new" ? undefined : editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove "{pendingDelete?.role} · {pendingDelete?.company}"?</DialogTitle>
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

function ExperienceFormDialog({
  item,
  open,
  onOpenChange,
}: {
  item?: Experience;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEditing = Boolean(item);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormInput>({
    values: item
      ? {
          company: item.company,
          role: item.role,
          location: item.location ?? "",
          description: item.description,
          startDate: toDateInputValue(item.startDate),
          endDate: toDateInputValue(item.endDate),
          isCurrent: item.isCurrent,
          order: item.order,
        }
      : { company: "", role: "", location: "", description: "", startDate: "", endDate: "", isCurrent: false, order: 0 },
  });

  const isCurrent = watch("isCurrent");

  async function onSubmit(data: ExperienceFormInput) {
    const parsed = experienceFormSchema.safeParse({ ...data, order: Number(data.order) });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    try {
      const res = await fetch(isEditing ? `/api/experience/${item!.id}` : "/api/experience", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Entry updated" : "Entry added");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit experience" : "Add experience"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-company">Company</Label>
              <Input id="exp-company" {...register("company")} />
              {errors.company && <p className="text-xs text-state-danger">{errors.company.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-role">Role</Label>
              <Input id="exp-role" {...register("role")} />
              {errors.role && <p className="text-xs text-state-danger">{errors.role.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-location">Location (optional)</Label>
            <Input id="exp-location" placeholder="Remote" {...register("location")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-description">Description</Label>
            <Textarea id="exp-description" rows={4} {...register("description")} />
            {errors.description && <p className="text-xs text-state-danger">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-start">Start date</Label>
              <Input id="exp-start" type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-state-danger">{errors.startDate.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-end">End date</Label>
              <Input id="exp-end" type="date" disabled={isCurrent} {...register("endDate")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isCurrent} onCheckedChange={(v) => setValue("isCurrent", v)} id="exp-current" />
            <Label htmlFor="exp-current">I currently work here</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-order">Order (lower shows first)</Label>
            <Input id="exp-order" type="number" className="max-w-[120px]" {...register("order", { valueAsNumber: true })} />
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Add entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
