import "server-only";

// Risk register reads + writes. Dual-mode: Supabase when configured, mock
// otherwise. Pages import from here, never branching on the mode themselves.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import { RISK_REGISTER as MOCK_RISK } from "@/lib/mock-data";

export interface RiskView {
  id: string;
  factor: string;
  severity: string;
  status: string;
  exposure: string;
  observation: string;
  owner: string;
}

interface RiskProfileRow {
  id: string;
  factor: string;
  severity: string;
  status: string;
  exposure: string | null;
  observation: string | null;
  owner: string | null;
}

export async function getRiskRegister(): Promise<RiskView[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_RISK.map((r) => ({
      id: r.id,
      factor: r.factor,
      severity: r.severity,
      status: r.status,
      exposure: r.exposure,
      observation: r.observation,
      owner: r.owner,
    }));
  }

  // Secure mode never falls back to demo data.
  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("risk_profiles")
    .select("id, factor, severity, status, exposure, observation, owner")
    .eq("client_id", ctx.clientId)
    .order("created_at", { ascending: true });
  const rows = (res.data ?? []) as RiskProfileRow[];

  return rows.map((r) => ({
    id: r.id,
    factor: r.factor,
    severity: r.severity,
    status: r.status,
    exposure: r.exposure ?? "",
    observation: r.observation ?? "",
    owner: r.owner ?? "",
  }));
}

export interface NewRiskInput {
  factor: string;
  severity: string;
  status: string;
  exposure: string;
  observation: string;
  owner: string;
}

/** Whether the current session may add/edit risk factors. */
export async function canWriteRisk(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const ctx = await getSessionContext();
  return Boolean(ctx.clientId) && (ctx.role === "advisor" || ctx.role === "admin");
}

/** Adds a risk factor to the register. Authority enforced here and by RLS. */
export async function createRisk(input: NewRiskInput): Promise<{ id: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Adding risk factors requires secure mode (Supabase is not configured).");
  }

  const ctx = await getSessionContext();
  const clientId = ctx.clientId;
  if (!clientId) throw new Error("No accessible client to attach this risk factor to.");
  if (ctx.role !== "advisor" && ctx.role !== "admin") {
    throw new Error("Only advisors or admins may add risk factors.");
  }

  const factor = input.factor.trim();
  if (!factor) throw new Error("A risk factor name is required.");

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("risk_profiles")
    .insert({
      client_id: clientId,
      factor,
      severity: input.severity.trim() || "Moderate",
      status: input.status.trim() || "Discussion Point",
      exposure: input.exposure.trim() || null,
      observation: input.observation.trim() || null,
      owner: input.owner.trim() || null,
    })
    .select("id")
    .single();

  if (res.error) throw new Error(res.error.message);
  return { id: (res.data as { id: string }).id };
}
