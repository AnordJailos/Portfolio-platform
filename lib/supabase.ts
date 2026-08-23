/**
 * lib/supabase.ts
 * ----------------------------------------------------------------------------
 * - `supabase`: browser-safe client (anon key) for public reads / storage URLs.
 *   Kept eager since NEXT_PUBLIC_* vars are inlined at build time anyway
 *   (no server secret at risk, and it's used directly in client components).
 * - `getSupabaseAdmin()`: server-only, lazy — same reasoning as getOpenAI()/
 *   getGroq() in lib/openai.ts: don't let a missing SUPABASE_SERVICE_ROLE_KEY
 *   crash module import; only fail the specific upload request that needs it.
 * ----------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

let supabaseAdminClient: ReturnType<typeof createClient> | null = null;
export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — required for server-side uploads.");
    }
    supabaseAdminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseAdminClient;
}

export const STORAGE_BUCKET = "portfolio-assets";
