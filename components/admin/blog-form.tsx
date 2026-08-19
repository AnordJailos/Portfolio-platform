"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { BlogPost } from "@prisma/client";
import { blogPostFormSchema, type BlogPostFormInput } from "@/lib/validations";
import { slugify, estimateReadingTime } from "@/lib/utils";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function BlogForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const { upload, isUploading } = useImageUpload();
  const isEditing = Boolean(post);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormInput>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: post
      ? {
          ...post,
          coverImage: post.coverImage ?? "",
          category: post.category ?? "",
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }
      : { status: "DRAFT", tags: [] },
  });

  const coverImage = watch("coverImage");
  const content = watch("content") ?? "";

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setValue("coverImage", url);
  }

  async function onSubmit(data: BlogPostFormInput) {
    try {
      const res = await fetch(isEditing ? `/api/blog/${post!.slug}` : "/api/blog", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save post");
      }
      toast.success(isEditing ? "Post updated" : "Post created");
      router.push("/admin/blog");
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
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" rows={2} {...register("excerpt")} />
        {errors.excerpt && <p className="text-xs text-state-danger">{errors.excerpt.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content (Markdown)</Label>
          <span className="font-mono text-xs text-foreground-faint">~{estimateReadingTime(content)} min read</span>
        </div>
        <Textarea id="content" rows={16} className="font-mono text-xs" {...register("content")} />
        {errors.content && <p className="text-xs text-state-danger">{errors.content.message}</p>}
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
          <img src={coverImage} alt="Cover preview" className="mt-2 h-32 rounded-md object-cover" />
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            defaultValue={post?.tags.join(", ")}
            onChange={(e) => setValue("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Label>Status</Label>
        <Select value={watch("status")} onValueChange={(v) => setValue("status", v as BlogPostFormInput["status"])}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Publish post"}
        </Button>
      </div>
    </form>
  );
}
