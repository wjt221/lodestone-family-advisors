import "server-only";

// Entity ownership reads. Who owns each entity (e.g. Scorpio = 70% Kim /
// 30% Cindy). Demo mode has a single-household structure, so it returns [].

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";

export interface EntityOwnerView {
  entityId: string;
  entityName: string;
  ownerName: string;
  pct: number;
  note: string;
}

interface OwnerRow {
  entity_id: string;
  owner_name: string;
  pct: number;
  note: string | null;
  entities: { name: string } | null;
}

export async function getEntityOwners(): Promise<EntityOwnerView[]> {
  if (!isSupabaseConfigured()) return [];

  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("entity_owners")
    .select("entity_id, owner_name, pct, note, entities ( name )")
    .eq("client_id", ctx.clientId)
    .order("pct", { ascending: false });
  const rows = (res.data ?? []) as unknown as OwnerRow[];

  return rows.map((r) => ({
    entityId: r.entity_id,
    entityName: r.entities?.name ?? "",
    ownerName: r.owner_name,
    pct: Number(r.pct),
    note: r.note ?? "",
  }));
}
