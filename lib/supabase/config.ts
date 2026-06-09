// Supabase configuration detection.
//
// Reads ONLY the public env vars so this module is safe to import from both
// client and server code. The service-role key is never referenced here.
//
// When Supabase is not configured the app runs in demo mode against mock data.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True when both public Supabase values are present. Used throughout the data
 * layer to decide between secure (Supabase) mode and demo (mock) mode.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
