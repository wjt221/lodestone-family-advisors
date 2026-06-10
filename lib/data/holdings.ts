import "server-only";

// Holdings reads. Returns the same `Holding` shape the UI already uses so charts
// and tables work identically in demo and secure modes.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { HoldingRow, TablesUpdate } from "@/lib/supabase/types";
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
  /** Ownership splits, e.g. [{ name: "Kim", pct: 70 }, { name: "Cindy", pct: 30 }]. */
  owners: { name: string; pct: number }[];
  /** 'Internal' | 'External' oversight per the schedule. */
  oversight: string;
  note: string;
  /** IRR stored directly on the holding row by the seeding process (decimal, e.g. 0.124). */
  storedIrr: number | null;
}

function parseOwners(value: unknown): { name: string; pct: number }[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((o): o is { name?: unknown; pct?: unknown } => typeof o === "object" && o !== null)
    .map((o) => ({ name: String(o.name ?? ""), pct: Number(o.pct ?? 0) }))
    .filter((o) => o.name && o.pct > 0);
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

  // Secure mode never falls back to demo data.
  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("holdings")
    .select(
      "id, entity_id, name, asset_class, market, liquidity, value, allocation_pct, manager, vintage, commitment, unfunded, mgmt_fee_pct, carry_pct, note",
    )
    .eq("client_id", ctx.clientId)
    .order("value", { ascending: false });
  const rows = (res.data ?? []) as HoldingRow[];

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
    owners: [{ name: entityName.get(h.entity) ?? "Family", pct: 100 }],
    oversight: "External",
    note: h.note ?? "",
    storedIrr: null,
  }));
}

interface DetailedRow extends HoldingRow {
  entities: { name: string } | null;
}

/** Full holdings detail (entity name, structure, strategy, cashflows). */
export async function getHoldingsDetailed(): Promise<HoldingView[]> {
  if (!isSupabaseConfigured()) return mockDetailed();

  // Secure mode never falls back to demo data.
  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("holdings")
    .select(
      "id, name, asset_class, market, liquidity, value, allocation_pct, manager, vintage, commitment, unfunded, contributions, distributions, irr, account, structure, strategy, status, owners, oversight, note, entities ( name )",
    )
    .eq("client_id", ctx.clientId)
    .order("value", { ascending: false });
  const rows = (res.data ?? []) as unknown as DetailedRow[];

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
    owners: parseOwners(r.owners),
    oversight: r.oversight ?? "",
    note: r.note ?? "",
    storedIrr: (r as unknown as { irr?: number | null }).irr != null
      ? Number((r as unknown as { irr: number }).irr)
      : null,
  }));
}

/** Whether the current session may edit holdings: secure mode + advisor/admin. */
export async function canWriteHoldings(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const ctx = await getSessionContext();
  return Boolean(ctx.clientId) && (ctx.role === "advisor" || ctx.role === "admin");
}

export interface HoldingUpdateInput {
  value?: number;
  assetClass?: string;
  strategy?: string;
  liquidity?: string;
}

/**
 * Updates a holding's classification/valuation. Authority enforced here and,
 * definitively, by RLS (`can_write_client`). Derived figures (weights, lenses,
 * charts) recompute from values on render, so changes are live immediately.
 */
export async function updateHolding(id: string, input: HoldingUpdateInput): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Editing holdings requires secure mode (Supabase is not configured).");
  }
  const ctx = await getSessionContext();
  if (!ctx.clientId) throw new Error("No accessible client.");
  if (ctx.role !== "advisor" && ctx.role !== "admin") {
    throw new Error("Only advisors or admins may edit holdings.");
  }

  const patch: TablesUpdate<"holdings"> = {};
  if (input.value != null) {
    if (!Number.isFinite(input.value)) throw new Error("Value must be a number.");
    patch.value = input.value;
  }
  if (input.assetClass?.trim()) patch.asset_class = input.assetClass.trim();
  if (input.strategy?.trim()) patch.strategy = input.strategy.trim();
  if (input.liquidity?.trim()) patch.liquidity = input.liquidity.trim();
  if (Object.keys(patch).length === 0) return;

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("holdings")
    .update(patch)
    .eq("id", id)
    .eq("client_id", ctx.clientId)
    .select("id")
    .single();
  if (res.error) throw new Error(res.error.message);
}
