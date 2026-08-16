"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { testimonialSubmissionSchema, type TestimonialSubmissionInput } from "@/lib/validations";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

export function TestimonialSubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const { upload, isUploading } = useImageUpload({ endpoint: "/api/testimonials/upload" });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialSubmissionInput>({ resolver: zodResolver(testimonialSubmissionSchema) });

  const avatar = watch("avatar");
  const authorName = watch("authorName");

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setValue("avatar", url);
  }

  async function onSubmit(data: TestimonialSubmissionInput) {
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit — please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-state-success" />
        <h2 className="font-display text-2xl text-foreground">Thank you!</h2>
        <p className="max-w-sm text-sm text-foreground-muted">
          Your testimonial has been sent for review — it'll appear on the site once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {/* Honeypot — hidden from real visitors via CSS, bots tend to fill every field. */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="company_website">Website</Label>
        <Input id="company_website" tabIndex={-1} autoComplete="off" {...register("company_website")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Your photo (optional)</Label>
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
          <Label htmlFor="authorName">Your name</Label>
          <Input id="authorName" placeholder="Ada Lovelace" {...register("authorName")} />
          {errors.authorName && <p className="text-xs text-state-danger">{errors.authorName.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="authorRole">Your role (optional)</Label>
          <Input id="authorRole" placeholder="Engineering Manager" {...register("authorRole")} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company">Organization (optional)</Label>
        <Input id="company" {...register("company")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quote">Your message</Label>
        <Textarea id="quote" rows={5} placeholder="What was it like working together?" {...register("quote")} />
        {errors.quote && <p className="text-xs text-state-danger">{errors.quote.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Your email (optional, kept private)</Label>
        <Input id="email" type="email" placeholder="In case there's any follow-up" {...register("email")} />
        {errors.email && <p className="text-xs text-state-danger">{errors.email.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="self-start">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {isSubmitting ? "Sending…" : "Submit testimonial"}
      </Button>
      <p className="text-xs text-foreground-faint">
        Submissions are reviewed before appearing on the site — yours won't show up immediately.
      </p>
    </form>
  );
}
