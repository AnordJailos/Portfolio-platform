"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { testimonialFormSchema, type TestimonialFormInput } from "@/lib/validations";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const router = useRouter();
  const { upload, isUploading } = useImageUpload({ folder: "testimonials" });
  const isEditing = Boolean(testimonial);
  const isVisitorSubmission = !!testimonial && "source" in testimonial && testimonial.source === "VISITOR";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormInput>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: testimonial
      ? {
          authorName: testimonial.authorName,
          authorRole: testimonial.authorRole ?? "",
          company: testimonial.company ?? "",
          quote: testimonial.quote,
          avatar: testimonial.avatar ?? "",
          email: testimonial.email ?? "",
          order: testimonial.order,
          published: testimonial.published,
        }
      : { published: true, order: 0 },
  });

  const avatar = watch("avatar");
  const authorName = watch("authorName");

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setValue("avatar", url);
  }

  async function onSubmit(data: TestimonialFormInput) {
    try {
      const res = await fetch(isEditing ? `/api/testimonials/${testimonial!.id}` : "/api/testimonials", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save testimonial");
      }
      toast.success(isEditing ? "Testimonial updated" : "Testimonial added");
      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6" noValidate>
      {testimonial?.source === "VISITOR" && (
        <p className="rounded-md border border-signal-amber/30 bg-signal-amber/5 px-4 py-3 text-xs text-foreground-muted">
          This was submitted by a site visitor{testimonial.email ? ` (${testimonial.email})` : ""}. Review the quote
          before publishing you can edit it freely.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label>Photo (optional)</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {avatar && <AvatarImage src={avatar} alt={authorName || "Preview"} />}
            <AvatarFallback>{authorName?.[0] ?? "?"}</AvatarFallback>
          </Avatar>
          <Input type="file" accept="image/*" onChange={handleAvatarUpload} className="max-w-xs" />
          {isUploading && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="authorName">Name</Label>
          <Input id="authorName" {...register("authorName")} />
          {errors.authorName && <p className="text-xs text-state-danger">{errors.authorName.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="authorRole">Role (optional)</Label>
          <Input id="authorRole" placeholder="Engineering Manager" {...register("authorRole")} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company">Company (optional)</Label>
        <Input id="company" {...register("company")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quote">Testimonial</Label>
        <Textarea id="quote" rows={5} {...register("quote")} />
        {errors.quote && <p className="text-xs text-state-danger">{errors.quote.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Contact email (private — never shown publicly)</Label>
        <Input id="email" type="email" placeholder="For your own follow-up only" {...register("email")} />
      </div>

      <div className="flex flex-wrap items-center gap-8 border-t border-border pt-6">
        <div className="flex items-center gap-3">
          <Switch checked={watch("published")} onCheckedChange={(v) => setValue("published", v)} id="published" />
          <Label htmlFor="published">Published (visible on the site)</Label>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="order">Order</Label>
          <Input id="order" type="number" className="w-24" {...register("order", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/testimonials")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Add testimonial"}
        </Button>
      </div>
    </form>
  );
}
