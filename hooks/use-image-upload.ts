"use client";

import { useState } from "react";

/**
 * Uploads a File to Supabase Storage via an API route and returns the public URL.
 * Defaults to the admin endpoint; pass `endpoint`/`folder` to target the
 * public testimonial upload route instead (see testimonial-submission-form.tsx).
 */
export function useImageUpload(options?: { endpoint?: string; folder?: string }) {
  const endpoint = options?.endpoint ?? "/api/upload";
  const folder = options?.folder;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<string | null> {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) formData.append("folder", folder);

      const res = await fetch(endpoint, { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      return body.url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, error };
}
