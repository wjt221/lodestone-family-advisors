"use client";

// Browser-safe Supabase client.
//
// Uses only the public anon key. All access is governed by Row-Level Security,
// so this client can only ever read/write rows the signed-in user is permitted
// to see. Never import the service-role key here.

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Database } from "./types";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY, or run in demo mode via the data layer.",
    );
  }
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
