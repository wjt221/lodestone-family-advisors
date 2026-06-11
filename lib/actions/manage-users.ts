"use server";

// Admin-only user lifecycle. Two clients are used deliberately:
//   • the SERVICE-ROLE admin client (createAdminClient) ONLY for the auth.users
//     lifecycle — inviting and deleting accounts — which genuinely requires it.
//   • the request-scoped server client (the signed-in admin's session) for every
//     profile / assignment table write, so Postgres RLS *and* the role-escalation
//     trigger remain in force. The service role bypasses RLS but NOT triggers, so
//     role changes must run as the admin, not the service role.
//
// Every action re-verifies the caller is an admin in secure mode before acting.

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured, SUPABASE_URL } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/data/session";
import type { UserRole } from "@/lib/supabase/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const ROLES: UserRole[] = ["client", "advisor", "admin"];

async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  if (!isSupabaseConfigured()) return { error: "User management requires secure mode." };
  const ctx = await getSessionContext();
  if (!ctx.userId) return { error: "You are not signed in." };
  if (ctx.role !== "admin") return { error: "Only administrators may manage users." };
  return { userId: ctx.userId };
}

/** Replace a user's single family-office attachment based on their role. */
async function setAttachment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: UserRole,
  clientId: string | null,
): Promise<void> {
  // Clear any existing attachments first so the UI's single-office model holds.
  await supabase.from("client_users").delete().eq("user_id", userId);
  await supabase.from("advisor_client_assignments").delete().eq("advisor_id", userId);

  if (!clientId) return; // admins (and unassigned users) need no row
  if (role === "client") {
    await supabase.from("client_users").insert({ user_id: userId, client_id: clientId });
  } else if (role === "advisor") {
    await supabase.from("advisor_client_assignments").insert({ advisor_id: userId, client_id: clientId });
  }
}

export async function inviteUser(input: {
  email: string;
  fullName: string;
  role: UserRole;
  clientId: string | null;
}): Promise<ActionResult> {
  const guard = await requireAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!ROLES.includes(input.role)) return { ok: false, error: "Invalid role." };
  if (input.role !== "admin" && !input.clientId) {
    return { ok: false, error: "Select a family office for this user." };
  }

  // 1. Invite the auth account (service role). The handle_new_user trigger
  //    creates a matching profile (role 'client') synchronously.
  const admin = createAdminClient();
  const base = process.env.NEXT_PUBLIC_SITE_URL || SUPABASE_URL;
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: base ? `${base}/auth/update-password` : undefined,
  });
  if (error) return { ok: false, error: error.message };
  const newUserId = data.user?.id;
  if (!newUserId) return { ok: false, error: "Invitation sent but the user id was not returned." };

  // 2. Set role + name + attachment as the admin (RLS + trigger enforced).
  const supabase = await createClient();
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ role: input.role, full_name: fullName })
    .eq("id", newUserId);
  if (profileErr) return { ok: false, error: profileErr.message };

  await setAttachment(supabase, newUserId, input.role, input.clientId);

  revalidatePath("/account");
  return { ok: true };
}

export async function updateUser(input: {
  userId: string;
  fullName?: string;
  role?: UserRole;
  clientId?: string | null;
}): Promise<ActionResult> {
  const guard = await requireAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };

  if (input.role && !ROLES.includes(input.role)) {
    return { ok: false, error: "Invalid role." };
  }
  // Guard against an admin removing their own admin rights and locking the org out.
  if (input.userId === guard.userId && input.role && input.role !== "admin") {
    return { ok: false, error: "You cannot change your own role away from admin." };
  }

  const supabase = await createClient();

  const patch: { full_name?: string; role?: UserRole } = {};
  if (input.fullName != null && input.fullName.trim()) patch.full_name = input.fullName.trim();
  if (input.role) patch.role = input.role;
  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", input.userId);
    if (error) return { ok: false, error: error.message };
  }

  // Reconcile the family-office attachment when a client/role change is supplied.
  if (input.clientId !== undefined || input.role) {
    const effectiveRole = input.role
      ?? ((await supabase.from("profiles").select("role").eq("id", input.userId).maybeSingle())
        .data as { role: UserRole } | null)?.role
      ?? "client";
    await setAttachment(supabase, input.userId, effectiveRole, input.clientId ?? null);
  }

  revalidatePath("/account");
  return { ok: true };
}

export async function removeUser(userId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };
  if (userId === guard.userId) {
    return { ok: false, error: "You cannot remove your own account." };
  }

  // Deleting the auth user cascades to profile + assignments (ON DELETE CASCADE).
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  return { ok: true };
}
