import "server-only";

// Session + access helpers for the data layer (server-side only).
//
// In demo mode these return a synthetic advisor context so the app is usable
// without auth. In secure mode they reflect the real Supabase session and the
// client the user is permitted to access (enforced by RLS).

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export interface SessionContext {
  configured: boolean;
  userId: string | null;
  email: string | null;
  role: UserRole;
  /** The client (family office) the current user is scoped to, if any. */
  clientId: string | null;
}

const DEMO_CONTEXT: SessionContext = {
  configured: false,
  userId: null,
  email: "demo@lodestone.local",
  role: "advisor",
  clientId: null,
};

export async function getSessionContext(): Promise<SessionContext> {
  if (!isSupabaseConfigured()) return DEMO_CONTEXT;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, userId: null, email: null, role: "client", clientId: null };
  }

  const profileRes = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRes.data as { role: UserRole; email: string | null } | null;

  const role = (profile?.role ?? "client") as UserRole;
  const clientId = await resolveClientId(supabase);

  return {
    configured: true,
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    role,
    clientId,
  };
}

/**
 * Resolves the active client id for the user. RLS guarantees these queries only
 * return rows the user may access, so the first match is a safe default for this
 * single-client demo. A multi-client UI would let the user choose.
 */
async function resolveClientId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
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

  // Admins (or any user able to read a client row) fall back to the first client.
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
