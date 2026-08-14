/**
 * Supabase clients.
 * - `supabase`: browser-safe client (anon key) for public reads / storage URLs.
 * - `supabaseAdmin`: server-only client (service role key) for image uploads
 *   from the admin dashboard. NEVER import supabaseAdmin from a "use client" file.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — required for server-side uploads.");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const STORAGE_BUCKET = "portfolio-assets";
