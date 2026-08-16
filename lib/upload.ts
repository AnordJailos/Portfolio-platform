/**
 * lib/upload.ts
 * ----------------------------------------------------------------------------
 * Shared by app/api/upload/route.ts (admin, any folder) and
 * app/api/testimonials/upload/route.ts (public, testimonials/ folder only).
 * Keeping validation in one place means the size/type rules can't drift
 * between an authenticated and an unauthenticated upload path.
 * ----------------------------------------------------------------------------
 */
import { nanoid } from "nanoid";
import { getSupabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Validates and uploads an image to Supabase Storage under `${folder}/{year}/{id}.{ext}`. */
export async function uploadImage(file: File, folder: string): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Unsupported file type. Use JPEG, PNG, WEBP, or GIF." };
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, error: "File is too large (max 5MB)." };
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${new Date().getFullYear()}/${nanoid()}.${extension}`;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType: file.type, cacheControl: "31536000" });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    console.error("Upload failed:", err);
    return {
      ok: false,
      error: "Upload failed — check that the Supabase storage bucket exists and SUPABASE_SERVICE_ROLE_KEY is set.",
    };
  }
}
