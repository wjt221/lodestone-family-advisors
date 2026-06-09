import "server-only";

// Holdings reads. Returns the same `Holding` shape the UI already uses so charts
// and tables work identically in demo and secure modes.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { HoldingRow } from "@/lib/supabase/types";
import {
  HOLDINGS as MOCK_HOLDINGS,
  type Holding,
  type AssetClass,
  type LiquidityBucket,
  type Market,
  type EntityId,
} from "@/lib/mock-data";

function mapRow(row: HoldingRow): Holding {
  return {
    id: row.id,
    name: row.name,
    assetClass: row.asset_class as AssetClass,
    market: row.market as Market,
    entity: (row.entity_id ?? "holdings") as EntityId,
    value: Number(row.value),
    allocationPct: Number(row.allocation_pct),
    liquidity: row.liquidity as LiquidityBucket,
    manager: row.manager ?? "",
    vintage: row.vintage ?? "",
    commitment: row.commitment ?? undefined,
    unfunded: row.unfunded ?? undefined,
    mgmtFeePct: Number(row.mgmt_fee_pct),
    carryPct: row.carry_pct ?? undefined,
    note: row.note ?? "",
  };
}

export async function getHoldings(): Promise<Holding[]> {
  if (!isSupabaseConfigured()) return MOCK_HOLDINGS;

  const ctx = await getSessionContext();
  if (!ctx.clientId) return MOCK_HOLDINGS;

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("holdings")
    .select(
      "id, entity_id, name, asset_class, market, liquidity, value, allocation_pct, manager, vintage, commitment, unfunded, mgmt_fee_pct, carry_pct, note",
    )
    .eq("client_id", ctx.clientId)
    .order("value", { ascending: false });
  const rows = (res.data ?? []) as HoldingRow[];

  if (rows.length === 0) return MOCK_HOLDINGS;
  return rows.map(mapRow);
}
