import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE-ROLE client — DANGER ZONE.
//
// This client uses SUPABASE_SERVICE_ROLE_KEY, which BYPASSES Row-Level Security
// and can read/write EVERY client's data. It exists only for trusted server-side
// administrative tasks (e.g. seeding, backfills, audit jobs).
//
// Rules:
//   • Never import this file from a Client Component or any browser-reachable code.
//   • The `import "server-only"` above makes such an import a build error.
//   • Never log or return the key. Never prefix it with NEXT_PUBLIC_.
//   • Prefer the request-scoped server client (./server) for all normal data
//     access so RLS stays in force.
//
// The app does NOT require this to function; it throws if the key is absent.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";
import type { Database } from "./types";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error(
      "Service-role client unavailable: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "must be set server-side. This should only run in trusted server contexts.",
    );
  }
  return createSupabaseClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
