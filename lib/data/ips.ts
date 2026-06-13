import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// Advisor-Led IPS Workbench — service layer
//
// One IPS profile per clientId. Secure mode persists to Supabase (RLS-scoped to
// the client; advisor/admin write). Demo mode has no server record — the
// workbench keeps state locally — so reads return null and writes are rejected.
// IPS content is never stored in the codebase.
// ─────────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { Json, Tables } from "@/lib/supabase/types";
import type {
  IPSProfile,
  IPSStatus,
  IPSSectionKey,
  AdvisorSessionData,
} from "@/lib/ips/ipsTypes";
import { IPS_SECTION_KEYS } from "@/lib/ips/ipsTypes";
import { emptyIPSProfile } from "@/lib/ips/ipsDefaults";
import { computeCompletion, generateIPSSummary as buildSummary } from "@/lib/ips/ipsSummaryGenerator";

type Row = Tables<"client_ips_profiles">;

function rowToProfile(row: Row): IPSProfile {
  const base = emptyIPSProfile(row.client_id);
  const ips = (row.ips_data ?? {}) as Partial<IPSProfile>;

  const profile: IPSProfile = {
    ...base,
    id: row.id,
    clientId: row.client_id,
    status: row.status as IPSStatus,
    completionPercentage: row.completion_percentage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByAdvisorId: row.created_by_advisor_id ?? undefined,
    lastUpdatedByAdvisorId: row.last_updated_by_advisor_id ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    approvedByAdvisorId: row.approved_by_advisor_id ?? undefined,
    advisorSession: { ...base.advisorSession, ...((row.advisor_session_data ?? {}) as object) },
    summary: { ...((row.summary_data ?? {}) as object) },
  };

  // Merge each content section over its defaults so required arrays always exist.
  for (const key of IPS_SECTION_KEYS) {
    const incoming = ips[key] as object | undefined;
    if (incoming) {
      profile[key] = { ...base[key], ...incoming } as never;
    }
  }
  return profile;
}

function sectionsOf(profile: IPSProfile): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of IPS_SECTION_KEYS) out[key] = profile[key];
  return out;
}

async function requireWriteContext(clientId?: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("IPS persistence requires a signed-in (secure) session.");
  }
  const ctx = await getSessionContext();
  if (ctx.role !== "advisor" && ctx.role !== "admin") {
    throw new Error("Only advisors may edit a client IPS.");
  }
  const cid = clientId ?? ctx.clientId;
  if (!cid) throw new Error("No client selected.");
  return { ctx, cid };
}

async function writeProfile(
  cid: string,
  profile: IPSProfile,
  advisorId: string | null,
): Promise<IPSProfile> {
  const supabase = await createServerSupabase();
  const next = { ...profile, completionPercentage: computeCompletion(profile) };

  const { data, error } = await supabase
    .from("client_ips_profiles")
    .upsert(
      {
        client_id: cid,
        status: next.status,
        completion_percentage: next.completionPercentage,
        created_by_advisor_id: next.createdByAdvisorId ?? advisorId ?? null,
        last_updated_by_advisor_id: advisorId,
        approved_at: next.approvedAt ?? null,
        approved_by_advisor_id: next.approvedByAdvisorId ?? null,
        ips_data: sectionsOf(next) as unknown as Json,
        advisor_session_data: next.advisorSession as unknown as Json,
        summary_data: next.summary as unknown as Json,
      },
      { onConflict: "client_id" },
    )
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return rowToProfile(data as Row);
}

/** The current IPS profile for a client (or the active client). Null if none / demo mode. */
export async function getClientIPS(clientId?: string): Promise<IPSProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const ctx = await getSessionContext();
  const cid = clientId ?? ctx.clientId;
  if (!cid) return null;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("client_ips_profiles")
    .select("*")
    .eq("client_id", cid)
    .maybeSingle();
  if (!data) return null;
  return rowToProfile(data as Row);
}

/** Create a fresh IPS profile and open it for an advisor-led session. */
export async function createClientIPS(clientId: string, advisorId: string): Promise<IPSProfile> {
  const { cid } = await requireWriteContext(clientId);
  const fresh = emptyIPSProfile(cid);
  fresh.status = "in_advisor_session";
  fresh.createdByAdvisorId = advisorId;
  fresh.advisorSession.advisorId = advisorId;
  return writeProfile(cid, fresh, advisorId);
}

/** Generic patch: provided top-level keys replace their counterparts. */
export async function updateClientIPS(
  clientId: string,
  data: Partial<IPSProfile>,
): Promise<IPSProfile> {
  const { ctx, cid } = await requireWriteContext(clientId);
  const current = (await getClientIPS(cid)) ?? (await createClientIPS(cid, ctx.userId ?? ""));
  const merged: IPSProfile = { ...current, ...data, clientId: cid };
  return writeProfile(cid, merged, ctx.userId ?? null);
}

/** Save one content section. Opens a session if the IPS was not yet started. */
export async function saveIPSSection(
  clientId: string,
  sectionKey: IPSSectionKey,
  sectionData: unknown,
): Promise<IPSProfile> {
  const { ctx, cid } = await requireWriteContext(clientId);
  const current = (await getClientIPS(cid)) ?? (await createClientIPS(cid, ctx.userId ?? ""));
  const next: IPSProfile = { ...current, [sectionKey]: sectionData } as IPSProfile;
  if (next.status === "not_started") next.status = "in_advisor_session";
  return writeProfile(cid, next, ctx.userId ?? null);
}

/** Save the advisor-session panel state (attendees, documents, outside advisors…). */
export async function saveAdvisorSession(
  clientId: string,
  sessionData: AdvisorSessionData,
): Promise<IPSProfile> {
  const { ctx, cid } = await requireWriteContext(clientId);
  const current = (await getClientIPS(cid)) ?? (await createClientIPS(cid, ctx.userId ?? ""));
  const next: IPSProfile = { ...current, advisorSession: sessionData };
  if (next.status === "not_started") next.status = "in_advisor_session";
  return writeProfile(cid, next, ctx.userId ?? null);
}

/** Generate (and persist) the Advisor-Facilitated IPS Draft summary. */
export async function generateIPSSummary(clientId: string): Promise<IPSProfile> {
  const { ctx, cid } = await requireWriteContext(clientId);
  const current = await getClientIPS(cid);
  if (!current) throw new Error("No IPS profile to summarize.");
  const summary = buildSummary(current, ctx.userId ?? undefined);
  summary.generatedAt = new Date().toISOString();
  const advanced: IPSStatus =
    current.status === "not_started" || current.status === "in_advisor_session"
      ? "draft_generated"
      : current.status;
  const next: IPSProfile = { ...current, summary, status: advanced };
  return writeProfile(cid, next, ctx.userId ?? null);
}

/** Move the IPS through its lifecycle (advisor review, follow-up, reviewed, archived…). */
export async function setIPSStatus(clientId: string, status: IPSStatus): Promise<IPSProfile> {
  const { ctx, cid } = await requireWriteContext(clientId);
  const current = await getClientIPS(cid);
  if (!current) throw new Error("No IPS profile.");
  return writeProfile(cid, { ...current, status }, ctx.userId ?? null);
}

/** Approve the IPS for internal use (advisor/admin). Records who and when. */
export async function approveIPSForInternalUse(
  clientId: string,
  advisorId: string,
): Promise<IPSProfile> {
  const { ctx, cid } = await requireWriteContext(clientId);
  const current = await getClientIPS(cid);
  if (!current) throw new Error("No IPS profile to approve.");
  const next: IPSProfile = {
    ...current,
    status: "approved_for_internal_use",
    approvedAt: new Date().toISOString(),
    approvedByAdvisorId: advisorId,
  };
  return writeProfile(cid, next, ctx.userId ?? null);
}
