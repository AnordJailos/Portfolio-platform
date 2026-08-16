"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Education } from "@prisma/client";
import { educationFormSchema, type EducationFormInput } from "@/lib/validations";
import { formatMonthYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function EducationManager({ items }: { items: Education[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Education | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Education | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/education/${pendingDelete.id}`, { method: "DELETE" });
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
          <Plus className="h-4 w-4" /> Add education
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{item.degree}</p>
              <p className="text-xs text-foreground-muted">
                {item.institution}
                {item.field ? ` · ${item.field}` : ""}
              </p>
              <p className="font-mono text-xs text-foreground-faint">
                {formatMonthYear(item.startDate)} — {item.endDate ? formatMonthYear(item.endDate) : "Present"}
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
            No education entries yet — add the first one above.
          </p>
        )}
      </div>

      <EducationFormDialog
        item={editing === "new" ? undefined : editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove "{pendingDelete?.degree}"?</DialogTitle>
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

function EducationFormDialog({
  item,
  open,
  onOpenChange,
}: {
  item?: Education;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEditing = Boolean(item);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormInput>({
    values: item
      ? {
          institution: item.institution,
          degree: item.degree,
          field: item.field ?? "",
          startDate: toDateInputValue(item.startDate),
          endDate: toDateInputValue(item.endDate),
          description: item.description ?? "",
          order: item.order,
        }
      : { institution: "", degree: "", field: "", startDate: "", endDate: "", description: "", order: 0 },
  });

  async function onSubmit(data: EducationFormInput) {
    const parsed = educationFormSchema.safeParse({ ...data, order: Number(data.order) });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    try {
      const res = await fetch(isEditing ? `/api/education/${item!.id}` : "/api/education", {
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
          <DialogTitle>{isEditing ? "Edit education" : "Add education"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edu-institution">Institution</Label>
            <Input id="edu-institution" {...register("institution")} />
            {errors.institution && <p className="text-xs text-state-danger">{errors.institution.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edu-degree">Degree</Label>
              <Input id="edu-degree" placeholder="B.Sc. Computer Science" {...register("degree")} />
              {errors.degree && <p className="text-xs text-state-danger">{errors.degree.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edu-field">Field (optional)</Label>
              <Input id="edu-field" {...register("field")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edu-start">Start date</Label>
              <Input id="edu-start" type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-state-danger">{errors.startDate.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edu-end">End date (optional)</Label>
              <Input id="edu-end" type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edu-description">Description (optional)</Label>
            <Textarea id="edu-description" rows={3} {...register("description")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edu-order">Order (lower shows first)</Label>
            <Input id="edu-order" type="number" className="max-w-[120px]" {...register("order", { valueAsNumber: true })} />
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
