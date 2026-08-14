import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { requireAdminSession } from "@/lib/auth";
import { getSupabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPEG, PNG, WEBP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${new Date().getFullYear()}/${nanoid()}.${extension}`;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType: file.type, cacheControl: "31536000" });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed — check that the Supabase storage bucket exists and SUPABASE_SERVICE_ROLE_KEY is set." },
      { status: 500 }
    );
  }
}
