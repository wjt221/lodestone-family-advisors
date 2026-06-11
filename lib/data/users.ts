import "server-only";

// User + profile reads for the Account page. Secure mode only — there is no
// user directory in demo mode. Listing every user is an admin-only capability;
// RLS (profiles_select / client_users_select / aca_select) enforces this even
// if a caller reaches these helpers, but we also gate on role for clear UX.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { UserRole } from "@/lib/supabase/types";

export interface CurrentProfile {
  id: string | null;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  /** True when running against Supabase (editing is possible). */
  configured: boolean;
}

export interface ManagedUser {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  /** Family offices this user is attached to (membership or advisory assignment). */
  clients: { id: string; name: string }[];
  /** True if this row is the signed-in admin themselves. */
  isSelf: boolean;
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  if (!isSupabaseConfigured()) {
    return { id: null, email: "demo@lodestone.local", fullName: null, role: "advisor", configured: false };
  }

  const ctx = await getSessionContext();
  return {
    id: ctx.userId,
    email: ctx.email,
    fullName: ctx.displayName,
    role: ctx.role,
    configured: true,
  };
}

/** Whether the current session may manage users: secure mode + admin role. */
export async function canManageUsers(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const ctx = await getSessionContext();
  return ctx.role === "admin";
}

/**
 * All users with their family-office attachments. Admin-only; returns [] for
 * anyone else. RLS is the real boundary — this just keeps the UI honest.
 */
export async function getManagedUsers(): Promise<ManagedUser[]> {
  if (!isSupabaseConfigured()) return [];

  const ctx = await getSessionContext();
  if (ctx.role !== "admin") return [];

  const supabase = await createServerSupabase();

  const [profilesRes, membershipsRes, assignmentsRes, clientsRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role").order("full_name"),
    supabase.from("client_users").select("user_id, client_id"),
    supabase.from("advisor_client_assignments").select("advisor_id, client_id"),
    supabase.from("clients").select("id, name"),
  ]);

  const profiles = (profilesRes.data ?? []) as {
    id: string; email: string | null; full_name: string | null; role: UserRole;
  }[];
  const memberships = (membershipsRes.data ?? []) as { user_id: string; client_id: string }[];
  const assignments = (assignmentsRes.data ?? []) as { advisor_id: string; client_id: string }[];
  const clients = (clientsRes.data ?? []) as { id: string; name: string }[];
  const clientName = new Map(clients.map((c) => [c.id, c.name]));

  const byUser = new Map<string, Map<string, string>>();
  const attach = (userId: string, clientId: string) => {
    const name = clientName.get(clientId);
    if (!name) return;
    const m = byUser.get(userId) ?? new Map<string, string>();
    m.set(clientId, name);
    byUser.set(userId, m);
  };
  for (const m of memberships) attach(m.user_id, m.client_id);
  for (const a of assignments) attach(a.advisor_id, a.client_id);

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    role: p.role,
    clients: [...(byUser.get(p.id)?.entries() ?? [])].map(([id, name]) => ({ id, name })),
    isSelf: p.id === ctx.userId,
  }));
}
