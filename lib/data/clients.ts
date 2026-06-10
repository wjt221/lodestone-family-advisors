import "server-only";

// Client (family office) + entity reads. Dual-mode: Supabase when configured,
// mock data otherwise. Pages should import from here, never branch on the mode
// themselves.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { ClientRow, EntityRow } from "@/lib/supabase/types";
import { CLIENT as MOCK_CLIENT, DIEZ_CLIENT, ENTITIES as MOCK_ENTITIES } from "@/lib/mock-data";

export interface ClientSummary {
  id: string;
  name: string;
  shortName: string;
  relationshipSince: string;
  reportingCurrency: string;
  asOf: string;
}

export interface EntitySummary {
  id: string;
  name: string;
  type: string;
  value: number;
  purpose: string;
}

const MOCK_CLIENT_SUMMARY: ClientSummary = {
  id: "mock-atwater",
  name: MOCK_CLIENT.name,
  shortName: MOCK_CLIENT.shortName,
  relationshipSince: MOCK_CLIENT.relationshipSince,
  reportingCurrency: MOCK_CLIENT.reportingCurrency,
  asOf: MOCK_CLIENT.asOf,
};

const DIEZ_CLIENT_SUMMARY: ClientSummary = {
  id: DIEZ_CLIENT.id,
  name: DIEZ_CLIENT.name,
  shortName: DIEZ_CLIENT.shortName,
  relationshipSince: DIEZ_CLIENT.relationshipSince,
  reportingCurrency: DIEZ_CLIENT.reportingCurrency,
  asOf: DIEZ_CLIENT.asOf,
};

const ALL_MOCK_CLIENTS: ClientSummary[] = [MOCK_CLIENT_SUMMARY, DIEZ_CLIENT_SUMMARY];

// Secure mode must NEVER surface demo data: when no client is resolvable we
// return a neutral placeholder, not the mock client.
const NO_CLIENT: ClientSummary = {
  id: "",
  name: "No client assigned",
  shortName: "",
  relationshipSince: "",
  reportingCurrency: "USD",
  asOf: "",
};

export async function getActiveClient(): Promise<ClientSummary> {
  if (!isSupabaseConfigured()) {
    const ctx = await getSessionContext();
    return ALL_MOCK_CLIENTS.find((c) => c.id === ctx.clientId) ?? MOCK_CLIENT_SUMMARY;
  }

  const ctx = await getSessionContext();
  if (!ctx.clientId) return NO_CLIENT;

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("clients")
    .select("id, name, short_name, relationship_since, reporting_currency, as_of")
    .eq("id", ctx.clientId)
    .maybeSingle();
  const data = res.data as ClientRow | null;

  if (!data) return NO_CLIENT;
  return {
    id: data.id,
    name: data.name,
    shortName: data.short_name ?? data.name,
    relationshipSince: data.relationship_since ?? "",
    reportingCurrency: data.reporting_currency,
    asOf: data.as_of ?? "",
  };
}

/** All clients visible to the current user (advisor/admin only; RLS enforces scope). */
export async function getAllAccessibleClients(): Promise<ClientSummary[]> {
  if (!isSupabaseConfigured()) return ALL_MOCK_CLIENTS;

  const ctx = await getSessionContext();
  if (ctx.role !== "advisor" && ctx.role !== "admin") return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("clients")
    .select("id, name, short_name, relationship_since, reporting_currency, as_of")
    .order("name");
  const rows = (res.data ?? []) as ClientRow[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    shortName: r.short_name ?? r.name,
    relationshipSince: r.relationship_since ?? "",
    reportingCurrency: r.reporting_currency,
    asOf: r.as_of ?? "",
  }));
}

export async function getEntities(): Promise<EntitySummary[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_ENTITIES.map((e) => ({ ...e }));
  }

  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("entities")
    .select("id, name, type, value, purpose")
    .eq("client_id", ctx.clientId)
    .order("value", { ascending: false });
  const rows = (res.data ?? []) as EntityRow[];

  return rows.map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type ?? "",
    value: Number(e.value),
    purpose: e.purpose ?? "",
  }));
}
