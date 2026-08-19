"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Project } from "@prisma/client";
import { projectFormSchema, type ProjectFormInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const { upload, isUploading } = useImageUpload();
  const isEditing = Boolean(project);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          ...project,
          coverImage: project.coverImage ?? "",
          githubUrl: project.githubUrl ?? "",
          liveUrl: project.liveUrl ?? "",
          role: project.role ?? "",
          gallery: project.gallery,
          tags: project.tags,
        }
      : { status: "DRAFT", featured: false, tags: [], gallery: [], order: 0 },
  });

  const title = watch("title");
  const coverImage = watch("coverImage");

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setValue("coverImage", url);
  }

  async function onSubmit(data: ProjectFormInput) {
    try {
      const res = await fetch(isEditing ? `/api/projects/${project!.id}` : "/api/projects", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save project");
      }
      toast.success(isEditing ? "Project updated" : "Project created");
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title")}
            onBlur={(e) => {
              if (!isEditing) setValue("slug", slugify(e.target.value));
            }}
          />
          {errors.title && <p className="text-xs text-state-danger">{errors.title.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && <p className="text-xs text-state-danger">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="summary">Summary (shown on cards)</Label>
        <Textarea id="summary" rows={2} {...register("summary")} />
        {errors.summary && <p className="text-xs text-state-danger">{errors.summary.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Full case study (Markdown supported)</Label>
        <Textarea id="description" rows={10} className="font-mono text-xs" {...register("description")} />
        {errors.description && <p className="text-xs text-state-danger">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Cover image</Label>
        <div className="flex items-center gap-3">
          <Input type="file" accept="image/*" onChange={handleCoverUpload} className="max-w-xs" />
          {isUploading && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
        </div>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-only preview of a
          // just-uploaded, arbitrary Supabase URL; not worth a next/image remotePatterns entry.
          <img src={coverImage} alt={title || "Cover preview"} className="mt-2 h-32 rounded-md object-cover" />
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            defaultValue={project?.tags.join(", ")}
            onChange={(e) => setValue("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Your role</Label>
          <Input id="role" {...register("role")} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" {...register("githubUrl")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input id="liveUrl" {...register("liveUrl")} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3">
          <Switch checked={watch("featured")} onCheckedChange={(v) => setValue("featured", v)} id="featured" />
          <Label htmlFor="featured">Featured on home page</Label>
        </div>

        <div className="flex items-center gap-3">
          <Label>Status</Label>
          <Select value={watch("status")} onValueChange={(v) => setValue("status", v as ProjectFormInput["status"])}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
