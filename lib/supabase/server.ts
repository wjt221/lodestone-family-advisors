import "server-only";

// Server-side Supabase client bound to the request's auth cookies.
//
// Uses the public anon key with the user's session, so Row-Level Security still
// applies — this client cannot escalate beyond the signed-in user's role. Use it
// in Server Components, Route Handlers, and Server Actions.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Database } from "./types";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured (missing public env vars).");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Called from a Server Component render where cookies are read-only.
        // Session refresh is handled in middleware, so it is safe to ignore.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* no-op outside a Server Action / Route Handler */
        }
      },
    },
  });
}
