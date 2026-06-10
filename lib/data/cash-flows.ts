import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import { MOCK_CASH_FLOWS } from "@/lib/mock-cash-flows";

export interface CashFlowView {
  id: string;
  holdingId: string;
  date: string; // YYYY-MM-DD
  amount: number; // negative = outflow, positive = inflow
  label: string;
  notes: string;
}

export interface NewCashFlow {
  holdingId: string;
  date: string;
  amount: number;
  label: string;
  notes?: string;
}

/** All cash flows for the active client, keyed by holding id. */
export async function getCashFlowsByHolding(): Promise<Map<string, CashFlowView[]>> {
  if (!isSupabaseConfigured()) {
    const map = new Map<string, CashFlowView[]>();
    for (const cf of MOCK_CASH_FLOWS) {
      const list = map.get(cf.holdingId) ?? [];
      list.push({ id: cf.id, holdingId: cf.holdingId, date: cf.date, amount: cf.amount, label: cf.label, notes: cf.notes });
      map.set(cf.holdingId, list);
    }
    return map;
  }

  const ctx = await getSessionContext();
  if (!ctx.clientId) return new Map();

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("cash_flows")
    .select("id, holding_id, flow_date, amount, label, notes")
    .eq("client_id", ctx.clientId)
    .order("flow_date", { ascending: true });

  const map = new Map<string, CashFlowView[]>();
  for (const row of data ?? []) {
    const list = map.get(row.holding_id) ?? [];
    list.push({
      id: row.id,
      holdingId: row.holding_id,
      date: row.flow_date,
      amount: Number(row.amount),
      label: row.label,
      notes: row.notes ?? "",
    });
    map.set(row.holding_id, list);
  }
  return map;
}

export interface YearlyFlowSummary {
  year: number;
  contributions: number; // capital deployed during the year (positive figure)
  distributions: number; // cash received during the year
  net: number; // distributions − contributions
}

/** Cash flows aggregated by calendar year for the active client. */
export async function getYearlyFlows(): Promise<YearlyFlowSummary[]> {
  const byHolding = await getCashFlowsByHolding();
  const byYear = new Map<number, { contributions: number; distributions: number }>();

  for (const flows of byHolding.values()) {
    for (const cf of flows) {
      const year = Number(cf.date.slice(0, 4));
      if (!Number.isFinite(year)) continue;
      const agg = byYear.get(year) ?? { contributions: 0, distributions: 0 };
      if (cf.amount < 0) agg.contributions += Math.abs(cf.amount);
      else agg.distributions += cf.amount;
      byYear.set(year, agg);
    }
  }

  return [...byYear.entries()]
    .map(([year, agg]) => ({
      year,
      contributions: agg.contributions,
      distributions: agg.distributions,
      net: agg.distributions - agg.contributions,
    }))
    .sort((a, b) => a.year - b.year);
}

/** Add a single cash-flow event. Secure mode only. */
export async function addCashFlow(input: NewCashFlow): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Cash-flow writes require secure mode.");
  const ctx = await getSessionContext();
  if (!ctx.clientId) throw new Error("No accessible client.");
  if (ctx.role !== "advisor" && ctx.role !== "admin") throw new Error("Only advisors may add cash flows.");

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("cash_flows").insert({
    client_id: ctx.clientId,
    holding_id: input.holdingId,
    flow_date: input.date,
    amount: input.amount,
    label: input.label,
    notes: input.notes ?? "",
  });
  if (error) throw new Error(error.message);
}

/** Delete a cash-flow event. Secure mode only. */
export async function deleteCashFlow(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Cash-flow deletes require secure mode.");
  const ctx = await getSessionContext();
  if (!ctx.clientId) throw new Error("No accessible client.");
  if (ctx.role !== "advisor" && ctx.role !== "admin") throw new Error("Only advisors may delete cash flows.");

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("cash_flows")
    .delete()
    .eq("id", id)
    .eq("client_id", ctx.clientId);
  if (error) throw new Error(error.message);
}
