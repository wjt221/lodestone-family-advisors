import "server-only";

// Holdings reads. Returns the same `Holding` shape the UI already uses so charts
// and tables work identically in demo and secure modes.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { HoldingRow } from "@/lib/supabase/types";
import {
  HOLDINGS as MOCK_HOLDINGS,
  ENTITIES as MOCK_ENTITIES,
  type Holding,
  type AssetClass,
  type LiquidityBucket,
  type Market,
  type EntityId,
} from "@/lib/mock-data";

/**
 * Plain-string holding view for pages. Unlike `Holding` (typed to the demo
 * model's unions), this carries whatever asset classes / entities / strategies
 * the data layer actually returns, plus the alt-investment detail columns.
 */
export interface HoldingView {
  id: string;
  name: string;
  assetClass: string;
  market: string;
  liquidity: string;
  value: number;
  allocationPct: number;
  manager: string;
  vintage: string;
  commitment: number | null;
  unfunded: number | null;
  contributions: number | null;
  distributions: number | null;
  account: string;
  structure: string;
  strategy: string;
  entityName: string;
  status: string;
}

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

function mockDetailed(): HoldingView[] {
  const entityName = new Map(MOCK_ENTITIES.map((e) => [e.id, e.name]));
  return MOCK_HOLDINGS.map((h) => ({
    id: h.id,
    name: h.name,
    assetClass: h.assetClass,
    market: h.market,
    liquidity: h.liquidity,
    value: h.value,
    allocationPct: h.allocationPct,
    manager: h.manager,
    vintage: h.vintage,
    commitment: h.commitment ?? null,
    unfunded: h.unfunded ?? null,
    contributions: null,
    distributions: null,
    account: "",
    structure: "",
    strategy: "",
    entityName: entityName.get(h.entity) ?? "",
    status: "Open",
  }));
}

interface DetailedRow extends HoldingRow {
  entities: { name: string } | null;
}

/** Full holdings detail (entity name, structure, strategy, cashflows). */
export async function getHoldingsDetailed(): Promise<HoldingView[]> {
  if (!isSupabaseConfigured()) return mockDetailed();

  const ctx = await getSessionContext();
  if (!ctx.clientId) return mockDetailed();

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("holdings")
    .select(
      "id, name, asset_class, market, liquidity, value, allocation_pct, manager, vintage, commitment, unfunded, contributions, distributions, account, structure, strategy, status, entities ( name )",
    )
    .eq("client_id", ctx.clientId)
    .order("value", { ascending: false });
  const rows = (res.data ?? []) as unknown as DetailedRow[];

  if (rows.length === 0) return mockDetailed();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    assetClass: r.asset_class,
    market: r.market,
    liquidity: r.liquidity,
    value: Number(r.value),
    allocationPct: Number(r.allocation_pct),
    manager: r.manager ?? "",
    vintage: r.vintage ?? "",
    commitment: r.commitment != null ? Number(r.commitment) : null,
    unfunded: r.unfunded != null ? Number(r.unfunded) : null,
    contributions: r.contributions != null ? Number(r.contributions) : null,
    distributions: r.distributions != null ? Number(r.distributions) : null,
    account: r.account ?? "",
    structure: r.structure ?? "",
    strategy: r.strategy ?? "",
    entityName: r.entities?.name ?? "",
    status: r.status ?? "Open",
  }));
}
