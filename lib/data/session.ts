import "server-only";

// Session + access helpers for the data layer (server-side only).
//
// In demo mode these return a synthetic advisor context so the app is usable
// without auth. In secure mode they reflect the real Supabase session and the
// client the user is permitted to access (enforced by RLS).

import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export interface SessionContext {
  configured: boolean;
  userId: string | null;
  email: string | null;
  /** Display name from the profiles table (full_name), if available. */
  displayName: string | null;
  role: UserRole;
  /** The client (family office) the current user is scoped to, if any. */
  clientId: string | null;
}

const DEMO_ADVISOR_ROLE: UserRole = "advisor";

export async function getSessionContext(): Promise<SessionContext> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const selected = cookieStore.get("lfa_active_client")?.value ?? "mock-atwater";
    return {
      configured: false,
      userId: null,
      email: "demo@lodestone.local",
      displayName: null,
      role: DEMO_ADVISOR_ROLE,
      clientId: selected,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, userId: null, email: null, displayName: null, role: "client", clientId: null };
  }

  const profileRes = await supabase
    .from("profiles")
    .select("role, email, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRes.data as { role: UserRole; email: string | null; full_name: string | null } | null;

  const role = (profile?.role ?? "client") as UserRole;
  const clientId = await resolveClientId(supabase, role);

  return {
    configured: true,
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    displayName: profile?.full_name ?? null,
    role,
    clientId,
  };
}

/**
 * Resolves the active client id for the user.
 * For advisors/admins: respects a cookie-based override so they can toggle
 * between family offices. For clients: always uses their assigned client.
 */
async function resolveClientId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  role: UserRole,
): Promise<string | null> {
  // Advisors and admins may have an explicit client selection stored in a cookie.
  if (role === "advisor" || role === "admin") {
    const cookieStore = await cookies();
    const selected = cookieStore.get("lfa_active_client")?.value;
    if (selected) {
      // RLS enforces the user can actually access this client.
      const { data } = await supabase
        .from("clients")
        .select("id")
        .eq("id", selected)
        .maybeSingle();
      if ((data as { id: string } | null)?.id) return (data as { id: string }).id;
    }
  }

  const membershipRes = await supabase
    .from("client_users")
    .select("client_id")
    .limit(1)
    .maybeSingle();
  const membership = membershipRes.data as { client_id: string } | null;
  if (membership?.client_id) return membership.client_id;

  const assignmentRes = await supabase
    .from("advisor_client_assignments")
    .select("client_id")
    .limit(1)
    .maybeSingle();
  const assignment = assignmentRes.data as { client_id: string } | null;
  if (assignment?.client_id) return assignment.client_id;

  // Admins fall back to the first accessible client.
  const clientRes = await supabase
    .from("clients")
    .select("id")
    .limit(1)
    .maybeSingle();
  const client = clientRes.data as { id: string } | null;
  return client?.id ?? null;
}

/** Whether advisor-only content (e.g. internal notes) should be shown. */
export function canSeeAdvisorContent(ctx: SessionContext): boolean {
  return !ctx.configured || ctx.role === "advisor" || ctx.role === "admin";
}

/**
 * True when running against mock data (no Supabase). Pages whose feature has no
 * real data model yet use this to show an honest "in preparation" state in
 * secure mode instead of demo content — demo data must never appear to a
 * signed-in client.
 */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}
