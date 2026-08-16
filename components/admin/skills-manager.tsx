"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Skill } from "@prisma/client";
import { skillFormSchema, type SkillFormInput } from "@/lib/validations";
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

export function SkillsManager({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Skill | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/skills/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Skill removed");
      router.refresh();
    } catch {
      toast.error("Couldn't remove that skill");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add skill
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-foreground-faint">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-foreground">{skill.name}</td>
                <td className="px-4 py-3 text-foreground-muted">{skill.category}</td>
                <td className="px-4 py-3 text-foreground-muted">{skill.level}/5</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(skill)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPendingDelete(skill)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-state-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-foreground-faint">
                  No skills yet — add the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SkillFormDialog skill={editing === "new" ? undefined : editing ?? undefined} open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove "{pendingDelete?.name}"?</DialogTitle>
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

function SkillFormDialog({
  skill,
  open,
  onOpenChange,
}: {
  skill?: Skill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEditing = Boolean(skill);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormInput>({
    values: skill
      ? { name: skill.name, category: skill.category, level: skill.level, order: skill.order }
      : { name: "", category: "", level: 3, order: 0 },
  });

  async function onSubmit(data: SkillFormInput) {
    const parsed = skillFormSchema.safeParse({ ...data, level: Number(data.level), order: Number(data.order) });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    try {
      const res = await fetch(isEditing ? `/api/skills/${skill!.id}` : "/api/skills", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Skill updated" : "Skill added");
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
          <DialogTitle>{isEditing ? "Edit skill" : "Add skill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="skill-name">Name</Label>
              <Input id="skill-name" placeholder="TypeScript" {...register("name")} />
              {errors.name && <p className="text-xs text-state-danger">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="skill-category">Category</Label>
              <Input id="skill-category" placeholder="Languages" {...register("category")} />
              {errors.category && <p className="text-xs text-state-danger">{errors.category.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="skill-level">Level (1–5)</Label>
              <Input id="skill-level" type="number" min={1} max={5} {...register("level", { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="skill-order">Order</Label>
              <Input id="skill-order" type="number" {...register("order", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Add skill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
