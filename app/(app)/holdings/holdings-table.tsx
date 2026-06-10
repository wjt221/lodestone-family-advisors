"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Plus, Trash2,
  Search, X, SlidersHorizontal, Check, ChevronRight,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import type { HoldingView } from "@/lib/data/holdings";
import type { CashFlowView } from "@/lib/data/cash-flows";
import { colorFor } from "@/lib/portfolio-math";
import { fmtMillions, fmtPct } from "@/lib/calculations";
import { xirr, moic, fmtIrr, fmtMoic } from "@/lib/irr";
import { StatusPill } from "@/components/status-pill";
import { Field, inputClass } from "@/components/form-controls";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";
type SortKey =
  | "name" | "assetClass" | "market" | "entityName" | "liquidity"
  | "manager" | "vintage" | "value" | "allocationPct" | "unfunded"
  | "irr" | "moic";

interface Filters {
  search: string;
  assetClasses: string[];
  entities: string[];
  liquidity: string[];
  market: string;
}

interface HoldingMetrics {
  irr: number | null;
  moic: number;
  totalInvested: number;
  totalDistributions: number;
}

const ASSET_CLASS_OPTIONS = [
  "Cash & Reserves", "Fixed Income", "Public Equity", "Private Credit",
  "Real Assets", "Private Equity & Venture", "Direct / Operating",
];
const LIQUIDITY_OPTIONS = ["Daily", "Quarterly", "Annual", "Multi-Year", "Illiquid"];
const ENTITY_OPTIONS = [
  { id: "Atwater Holdings LLC", label: "Holdings LLC" },
  { id: "Atwater Family Trust", label: "Family Trust" },
  { id: "Atwater Investment Partnership LP", label: "Investment Partnership" },
];
const CF_LABELS = [
  "Initial investment", "Add-on equity", "Capital call",
  "Income distribution", "Return of capital", "Dividend / income",
  "Partial sale / realisation", "Other",
];
const EMPTY_FILTERS: Filters = {
  search: "", assetClasses: [], entities: [], liquidity: [], market: "",
};
const BLANK_FORM = {
  name: "", assetClass: "Public Equity", market: "Public",
  entityName: "Atwater Holdings LLC", value: "", liquidity: "Daily",
  manager: "", vintage: "", commitment: "", unfunded: "", note: "",
};
const BLANK_CF = { date: "", amount: "", label: "Capital call", notes: "" };

// ── IRR helpers ───────────────────────────────────────────────────────────────

function computeMetrics(
  cashFlows: CashFlowView[],
  currentValue: number,
  storedContributions?: number | null,
  storedDistributions?: number | null,
): HoldingMetrics {
  const today = new Date();
  const sorted = [...cashFlows].sort((a, b) => a.date.localeCompare(b.date));

  const cfInvested = sorted
    .filter((cf) => cf.amount < 0)
    .reduce((s, cf) => s + Math.abs(cf.amount), 0);
  const cfDistributions = sorted
    .filter((cf) => cf.amount > 0)
    .reduce((s, cf) => s + cf.amount, 0);

  // When no cash flows exist, fall back to the stored contributions/distributions
  // columns on the holding row so MOIC can still be displayed.
  const hasCashFlows = sorted.length > 0;
  const totalInvested = hasCashFlows ? cfInvested : (storedContributions ?? 0);
  const totalDistributions = hasCashFlows ? cfDistributions : (storedDistributions ?? 0);

  const xirrFlows = [
    ...sorted.map((cf) => ({ date: new Date(cf.date), amount: cf.amount })),
    { date: today, amount: currentValue },
  ];

  const irrVal = hasCashFlows ? xirr(xirrFlows) : null;
  const moicVal = moic(totalInvested, currentValue, totalDistributions);

  return { irr: irrVal, moic: moicVal, totalInvested, totalDistributions };
}

// ── Sort / filter ─────────────────────────────────────────────────────────────

function sortRows(
  rows: HoldingView[],
  key: SortKey,
  dir: SortDir,
  metrics: Map<string, HoldingMetrics>,
): HoldingView[] {
  return [...rows].sort((a, b) => {
    let av: number | string;
    let bv: number | string;
    if (key === "irr") {
      av = metrics.get(a.id)?.irr ?? -Infinity;
      bv = metrics.get(b.id)?.irr ?? -Infinity;
    } else if (key === "moic") {
      av = metrics.get(a.id)?.moic ?? 0;
      bv = metrics.get(b.id)?.moic ?? 0;
    } else {
      av = (a[key as keyof HoldingView] as number | string) ?? "";
      bv = (b[key as keyof HoldingView] as number | string) ?? "";
    }
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
    return dir === "asc" ? cmp : -cmp;
  });
}

function filterRows(rows: HoldingView[], f: Filters): HoldingView[] {
  return rows.filter((h) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!h.name.toLowerCase().includes(q) && !h.manager.toLowerCase().includes(q)) return false;
    }
    if (f.assetClasses.length && !f.assetClasses.includes(h.assetClass)) return false;
    if (f.entities.length && !f.entities.includes(h.entityName)) return false;
    if (f.liquidity.length && !f.liquidity.includes(h.liquidity)) return false;
    if (f.market && h.market !== f.market) return false;
    return true;
  });
}

// ── Multi-select ──────────────────────────────────────────────────────────────

function MultiSelect({ label, options, selected, onChange }: {
  label: string; options: string[];
  selected: string[]; onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] transition-colors",
          selected.length ? "border-brand/40 bg-brand/8 text-brand" : "border-hairline bg-card text-ink-muted hover:border-brand/30 hover:text-ink",
        )}>
        {label}
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">{selected.length}</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-20 min-w-[180px] rounded-xl border border-hairline bg-card shadow-lg">
            <ul className="py-1.5">
              {options.map((opt) => (
                <li key={opt}>
                  <button type="button" onClick={() => toggle(opt)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[12.5px] text-ink transition-colors hover:bg-secondary">
                    <span className={cn("flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border", selected.includes(opt) ? "border-brand bg-brand text-white" : "border-hairline")}>
                      {selected.includes(opt) && <Check className="h-2.5 w-2.5" />}
                    </span>
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// ── Add holding modal ──────────────────────────────────────────────────────────

function AddHoldingModal({ onAdd, onClose }: {
  onAdd: (h: HoldingView) => void; onClose: () => void;
}) {
  const [form, setForm] = useState(BLANK_FORM);
  const [error, setError] = useState("");
  const set = (k: keyof typeof BLANK_FORM, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return setError("Name is required.");
    const value = parseFloat(form.value);
    if (!isFinite(value) || value < 0) return setError("Value must be a positive number.");
    setError("");
    onAdd({
      id: `custom-${Date.now()}`, name: form.name.trim(),
      assetClass: form.assetClass, market: form.market,
      entityName: form.entityName, liquidity: form.liquidity,
      value, allocationPct: 0, manager: form.manager.trim(),
      vintage: form.vintage.trim(),
      commitment: form.commitment ? parseFloat(form.commitment) : null,
      unfunded: form.unfunded ? parseFloat(form.unfunded) : null,
      contributions: null, distributions: null, account: "", structure: "",
      strategy: "", status: "Open",
      owners: [{ name: form.entityName, pct: 100 }],
      oversight: "External", note: form.note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-16 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-hairline bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="font-serif text-[18px] font-medium text-ink">Add holding</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && <p className="rounded-md border border-critical/25 bg-critical-soft px-3 py-2 text-[12.5px] text-critical">{error}</p>}
          <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Blackrock Multi-Asset Fund" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Asset class"><select className={inputClass} value={form.assetClass} onChange={(e) => set("assetClass", e.target.value)}>{ASSET_CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Market"><select className={inputClass} value={form.market} onChange={(e) => set("market", e.target.value)}><option value="Public">Public</option><option value="Private">Private</option></select></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Entity"><select className={inputClass} value={form.entityName} onChange={(e) => set("entityName", e.target.value)}>{ENTITY_OPTIONS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select></Field>
            <Field label="Liquidity"><select className={inputClass} value={form.liquidity} onChange={(e) => set("liquidity", e.target.value)}>{LIQUIDITY_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current value (USD)" hint="Full amount e.g. 1500000"><input className={inputClass} type="number" min="0" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="1500000" /></Field>
            <Field label="Manager"><input className={inputClass} value={form.manager} onChange={(e) => set("manager", e.target.value)} placeholder="Manager name" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vintage"><input className={inputClass} value={form.vintage} onChange={(e) => set("vintage", e.target.value)} placeholder="e.g. 2024" /></Field>
            <Field label="Commitment (optional)"><input className={inputClass} type="number" min="0" value={form.commitment} onChange={(e) => set("commitment", e.target.value)} placeholder="e.g. 2000000" /></Field>
          </div>
          <Field label="Note (optional)"><textarea className={cn(inputClass, "resize-none")} rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} /></Field>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-hairline px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-hairline px-4 py-1.5 text-[13px] text-ink-muted hover:text-ink">Cancel</button>
          <button type="button" onClick={submit} className="rounded-lg bg-brand px-4 py-1.5 text-[13px] font-medium text-white hover:opacity-90">Add holding</button>
        </div>
      </div>
    </div>
  );
}

// ── Cash flow detail panel ────────────────────────────────────────────────────

function CashFlowPanel({
  holding, flows, metrics, onAddFlow, onRemoveFlow,
}: {
  holding: HoldingView;
  flows: CashFlowView[];
  metrics: HoldingMetrics;
  onAddFlow: (hid: string, cf: CashFlowView) => void;
  onRemoveFlow: (hid: string, cfId: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_CF);
  const [formError, setFormError] = useState("");
  const set = (k: keyof typeof BLANK_CF, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submitCf = () => {
    if (!form.date) return setFormError("Date is required.");
    const amount = parseFloat(form.amount);
    if (!isFinite(amount) || amount === 0) return setFormError("Enter a non-zero amount. Use negative for capital out.");
    setFormError("");
    onAddFlow(holding.id, {
      id: `cf-${Date.now()}`, holdingId: holding.id,
      date: form.date, amount, label: form.label, notes: form.notes,
    });
    setForm(BLANK_CF);
    setShowForm(false);
  };

  const sorted = [...flows].sort((a, b) => a.date.localeCompare(b.date));
  const irrTone = metrics.irr === null ? "neutral" : metrics.irr >= 0.1 ? "positive" : metrics.irr >= 0 ? "caution" : "critical";

  return (
    <div className="bg-secondary/30 px-4 py-4 border-t border-hairline">
      {/* Summary strip */}
      <div className="mb-4 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-ink-muted">Total invested</p>
          <p className="mt-0.5 font-medium text-ink">{fmtMillions(metrics.totalInvested, 2)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-ink-muted">Distributions</p>
          <p className="mt-0.5 font-medium text-ink">{metrics.totalDistributions > 0 ? fmtMillions(metrics.totalDistributions, 2) : "—"}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-ink-muted">Current value</p>
          <p className="mt-0.5 font-medium text-ink">{fmtMillions(holding.value, 2)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-ink-muted">MOIC</p>
          <p className="mt-0.5 font-semibold text-ink">{fmtMoic(metrics.moic)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-ink-muted">IRR (XIRR)</p>
          <p className={cn("mt-0.5 font-semibold",
            irrTone === "positive" ? "text-positive" : irrTone === "critical" ? "text-critical" : irrTone === "caution" ? "text-caution" : "text-ink-muted",
          )}>
            {fmtIrr(metrics.irr)}
          </p>
        </div>
        <div className="ml-auto">
          <button type="button" onClick={() => setShowForm((v) => !v)}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 text-[12px] text-ink-muted transition-colors hover:text-brand">
            <Plus className="h-3.5 w-3.5" />
            Add cash flow
          </button>
        </div>
      </div>

      {/* Add cash flow form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-hairline bg-card p-4">
          <p className="mb-3 text-[12.5px] font-medium text-ink">New cash flow event</p>
          {formError && <p className="mb-2 text-[12px] text-critical">{formError}</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Date">
              <input type="date" className={inputClass} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Amount" hint="Negative = capital out">
              <input type="number" className={inputClass} value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="-1000000" />
            </Field>
            <Field label="Type">
              <select className={inputClass} value={form.label} onChange={(e) => set("label", e.target.value)}>
                {CF_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Notes (optional)">
              <input className={inputClass} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional context" />
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={submitCf} className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setFormError(""); }} className="rounded-lg border border-hairline px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      {/* Cash flow table */}
      {sorted.length === 0 ? (
        <p className="text-[12.5px] text-ink-muted">No cash flows recorded. Add the initial investment to start tracking IRR.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[560px] text-[12.5px]">
            <thead>
              <tr className="border-b border-hairline bg-secondary/60">
                <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-ink-muted text-[11px]">Date</th>
                <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-ink-muted text-[11px]">Type</th>
                <th className="px-4 py-2.5 text-right font-semibold uppercase tracking-wide text-ink-muted text-[11px]">Amount</th>
                <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-ink-muted text-[11px]">Notes</th>
                <th className="w-8 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {sorted.map((cf) => (
                <tr key={cf.id} className="group hover:bg-secondary/40">
                  <td className="px-4 py-2.5 text-ink-muted">{cf.date}</td>
                  <td className="px-4 py-2.5 text-ink">{cf.label}</td>
                  <td className={cn("tnum px-4 py-2.5 text-right font-medium", cf.amount < 0 ? "text-critical" : "text-positive")}>
                    {cf.amount < 0 ? "-" : "+"}{fmtMillions(Math.abs(cf.amount), 2)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-2.5 text-ink-muted">{cf.notes || "—"}</td>
                  <td className="px-2 py-2.5">
                    <button type="button" onClick={() => onRemoveFlow(holding.id, cf.id)}
                      className="rounded p-1 text-transparent transition-colors group-hover:text-ink-muted hover:!text-critical">
                      <X className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Terminal row: current value */}
              <tr className="bg-secondary/20 italic">
                <td className="px-4 py-2.5 text-ink-muted">Today (terminal)</td>
                <td className="px-4 py-2.5 text-ink-muted">Current market value</td>
                <td className="tnum px-4 py-2.5 text-right font-medium text-positive">{fmtMillions(holding.value, 2)}</td>
                <td className="px-4 py-2.5 text-ink-muted/60 text-[11px]">Used as terminal CF in XIRR</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[11px] text-ink-muted">
        IRR computed via XIRR (Newton-Raphson). Current market value treated as terminal cash flow. Illustrative — requires advisor review.
      </p>
    </div>
  );
}

// ── Column header ─────────────────────────────────────────────────────────────

function ColHeader({ label, sortKey, current, dir, onSort, right }: {
  label: string; sortKey: SortKey; current: SortKey | null;
  dir: SortDir; onSort: (k: SortKey) => void; right?: boolean;
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th className={cn("cursor-pointer select-none whitespace-nowrap px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors", right ? "text-right" : "text-left", active ? "text-brand" : "text-ink-muted hover:text-ink")} onClick={() => onSort(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {right && <Icon className="h-3 w-3 opacity-60" />}
        {label}
        {!right && <Icon className="h-3 w-3 opacity-60" />}
      </span>
    </th>
  );
}

// ── IRR badge ─────────────────────────────────────────────────────────────────

function IrrBadge({ irr }: { irr: number | null }) {
  if (irr === null) return <span className="text-ink-muted/60">—</span>;
  const pct = irr * 100;
  const Icon = pct >= 10 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const color = pct >= 10 ? "text-positive" : pct < 0 ? "text-critical" : "text-caution";
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold", color)}>
      <Icon className="h-3 w-3" />
      {fmtIrr(irr)}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function HoldingsTable({
  initial, initialCashFlows,
}: {
  initial: HoldingView[];
  initialCashFlows: Record<string, CashFlowView[]>;
}) {
  const [rows, setRows] = useState<HoldingView[]>(initial);
  const [cashFlows, setCashFlows] = useState<Record<string, CashFlowView[]>>(initialCashFlows);
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const totalAum = useMemo(() => rows.reduce((s, h) => s + h.value, 0), [rows]);

  const metrics = useMemo(() => {
    const map = new Map<string, HoldingMetrics>();
    for (const h of rows) {
      const flows = cashFlows[h.id] ?? [];
      map.set(h.id, computeMetrics(flows, h.value, h.contributions, h.distributions));
    }
    return map;
  }, [rows, cashFlows]);

  const visible = useMemo(() => {
    const filtered = filterRows(rows, filters);
    return sortRows(filtered, sortKey, sortDir, metrics);
  }, [rows, filters, sortKey, sortDir, metrics]);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }, [sortKey]);

  const handleAdd = useCallback((h: HoldingView) => { setRows((prev) => [h, ...prev]); setShowAdd(false); }, []);
  const handleDelete = useCallback((id: string) => { setRows((prev) => prev.filter((h) => h.id !== id)); setConfirmDelete(null); if (expandedRow === id) setExpandedRow(null); }, [expandedRow]);

  const handleAddFlow = useCallback((hid: string, cf: CashFlowView) => {
    setCashFlows((prev) => ({ ...prev, [hid]: [...(prev[hid] ?? []), cf] }));
  }, []);
  const handleRemoveFlow = useCallback((hid: string, cfId: string) => {
    setCashFlows((prev) => ({ ...prev, [hid]: (prev[hid] ?? []).filter((f) => f.id !== cfId) }));
  }, []);

  const setFilter = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const activeFilterCount = (filters.assetClasses.length > 0 ? 1 : 0) + (filters.entities.length > 0 ? 1 : 0) + (filters.liquidity.length > 0 ? 1 : 0) + (filters.market ? 1 : 0);
  const hasAnyFilter = !!filters.search || activeFilterCount > 0;
  const liquidityTone = (liq: string) => liq === "Daily" ? "positive" : liq === "Illiquid" ? "critical" : "caution";
  const entityOptions = useMemo(() => [...new Set(rows.map((h) => h.entityName).filter(Boolean))], [rows]);

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted/60" />
            <input className="h-8 w-full rounded-lg border border-hairline bg-card pl-8 pr-3 text-[13px] placeholder:text-ink-muted/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" placeholder="Search by name or manager…" value={filters.search} onChange={(e) => setFilter("search", e.target.value)} />
            {filters.search && <button type="button" onClick={() => setFilter("search", "")} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <button type="button" onClick={() => setShowFilters((v) => !v)}
            className={cn("flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] transition-colors", showFilters || activeFilterCount ? "border-brand/40 bg-brand/8 text-brand" : "border-hairline bg-card text-ink-muted hover:border-brand/30 hover:text-ink")}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">{activeFilterCount}</span>}
          </button>
          {hasAnyFilter && <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] text-ink-muted hover:text-critical"><X className="h-3.5 w-3.5" />Clear</button>}
          <span className="text-[12px] text-ink-muted">{visible.length === rows.length ? `${rows.length} positions` : `${visible.length} of ${rows.length} positions`}</span>
        </div>
        <button type="button" onClick={() => setShowAdd(true)} className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-[13px] font-medium text-white hover:opacity-90">
          <Plus className="h-4 w-4" />Add holding
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-card px-4 py-3">
          <MultiSelect label="Asset class" options={ASSET_CLASS_OPTIONS} selected={filters.assetClasses} onChange={(v) => setFilter("assetClasses", v)} />
          <MultiSelect label="Entity" options={entityOptions} selected={filters.entities} onChange={(v) => setFilter("entities", v)} />
          <MultiSelect label="Liquidity" options={LIQUIDITY_OPTIONS} selected={filters.liquidity} onChange={(v) => setFilter("liquidity", v)} />
          <div className="flex items-center gap-1 rounded-lg border border-hairline bg-secondary p-1">
            {(["", "Public", "Private"] as const).map((m) => (
              <button key={m || "all"} type="button" onClick={() => setFilter("market", m)}
                className={cn("rounded-md px-2.5 py-1 text-[12px] transition-colors", filters.market === m ? "bg-card font-medium text-brand shadow-sm" : "text-ink-muted hover:text-ink")}>
                {m || "All markets"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full min-w-[1200px] text-[13px]">
          <thead>
            <tr className="border-b border-hairline bg-secondary/60">
              <th className="w-8 px-2 py-3" />
              <ColHeader label="Holding"     sortKey="name"         current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Asset class" sortKey="assetClass"   current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Entity"      sortKey="entityName"   current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Liquidity"   sortKey="liquidity"    current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Vintage"     sortKey="vintage"      current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="IRR"         sortKey="irr"          current={sortKey} dir={sortDir} onSort={handleSort} right />
              <ColHeader label="MOIC"        sortKey="moic"         current={sortKey} dir={sortDir} onSort={handleSort} right />
              <ColHeader label="Value"       sortKey="value"        current={sortKey} dir={sortDir} onSort={handleSort} right />
              <ColHeader label="Weight"      sortKey="allocationPct" current={sortKey} dir={sortDir} onSort={handleSort} right />
              <ColHeader label="Unfunded"    sortKey="unfunded"     current={sortKey} dir={sortDir} onSort={handleSort} right />
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={12} className="px-6 py-12 text-center text-[13px] text-ink-muted">No positions match the current filters.</td></tr>
            )}
            {visible.map((h) => {
              const m = metrics.get(h.id)!;
              const weight = totalAum > 0 ? (h.value / totalAum) * 100 : 0;
              const isDeleting = confirmDelete === h.id;
              const isExpanded = expandedRow === h.id;
              const hasCf = (cashFlows[h.id] ?? []).length > 0;

              return [
                <tr key={h.id}
                  className={cn("group border-b border-hairline transition-colors", isDeleting ? "bg-critical/5" : "hover:bg-secondary/40")}>
                  {/* Expand toggle */}
                  <td className="px-2 py-3.5">
                    <button type="button" onClick={() => setExpandedRow(isExpanded ? null : h.id)}
                      className={cn("rounded p-1 transition-colors", isExpanded ? "text-brand" : "text-ink-muted/40 hover:text-brand")}>
                      <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")} />
                    </button>
                  </td>
                  {/* Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: colorFor(h.assetClass) }} />
                      <div className="min-w-0">
                        <p className="max-w-[200px] truncate font-medium text-ink">{h.name}</p>
                        <p className="max-w-[200px] truncate text-[11px] text-ink-muted/70">{h.manager || ""}{h.vintage ? ` · ${h.vintage}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  {/* Asset class */}
                  <td className="px-4 py-3.5">
                    <span className="inline-block max-w-[140px] truncate rounded-full px-2 py-0.5 text-[11.5px] font-medium"
                      style={{ background: `${colorFor(h.assetClass)}18`, color: colorFor(h.assetClass) }}>
                      {h.assetClass}
                    </span>
                  </td>
                  <td className="max-w-[130px] truncate px-4 py-3.5 text-ink-muted">{h.entityName || "Managed Accounts"}</td>
                  <td className="px-4 py-3.5"><StatusPill tone={liquidityTone(h.liquidity)} dot={false}>{h.liquidity}</StatusPill></td>
                  <td className="px-4 py-3.5 text-ink-muted">{h.vintage || "—"}</td>
                  {/* IRR */}
                  <td className="tnum px-4 py-3.5 text-right"><IrrBadge irr={m.irr} /></td>
                  {/* MOIC */}
                  <td className="tnum px-4 py-3.5 text-right text-ink-muted">{m.moic > 0 ? fmtMoic(m.moic) : "—"}</td>
                  {/* Value */}
                  <td className="tnum px-4 py-3.5 text-right font-medium text-ink">{fmtMillions(h.value, 2)}</td>
                  {/* Weight bar */}
                  <td className="tnum px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(weight * 2.5, 100)}%`, background: colorFor(h.assetClass) }} />
                      </div>
                      <span className="w-10 text-right text-ink">{fmtPct(weight, 1)}</span>
                    </div>
                  </td>
                  {/* Unfunded */}
                  <td className="tnum px-4 py-3.5 text-right text-ink-muted">{h.unfunded ? fmtMillions(h.unfunded, 2) : "—"}</td>
                  {/* Delete */}
                  <td className="px-3 py-3.5">
                    {isDeleting ? (
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleDelete(h.id)} className="rounded-md bg-critical px-2 py-1 text-[11px] font-medium text-white hover:opacity-90">Remove</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md border border-hairline px-2 py-1 text-[11px] text-ink-muted hover:text-ink">Cancel</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(h.id)}
                        className="rounded-md p-1.5 text-transparent transition-colors group-hover:text-ink-muted hover:!text-critical"
                        aria-label={`Remove ${h.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>,
                // Expanded cash flow panel
                isExpanded ? (
                  <tr key={`${h.id}-detail`} className="border-b border-hairline">
                    <td colSpan={12} className="p-0">
                      <CashFlowPanel
                        holding={h}
                        flows={cashFlows[h.id] ?? []}
                        metrics={m}
                        onAddFlow={handleAddFlow}
                        onRemoveFlow={handleRemoveFlow}
                      />
                    </td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
          {visible.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-hairline bg-secondary/40">
                <td colSpan={8} className="px-4 py-3 text-[12px] font-semibold text-ink">
                  {visible.length < rows.length ? `Filtered total (${visible.length} positions)` : `Total (${rows.length} positions)`}
                </td>
                <td className="tnum px-4 py-3 text-right text-[13px] font-semibold text-ink">{fmtMillions(visible.reduce((s, h) => s + h.value, 0), 2)}</td>
                <td className="tnum px-4 py-3 text-right text-[12px] font-semibold text-ink">{fmtPct(totalAum > 0 ? (visible.reduce((s, h) => s + h.value, 0) / totalAum) * 100 : 0, 1)}</td>
                <td className="tnum px-4 py-3 text-right text-[12px] font-semibold text-ink">{fmtMillions(visible.reduce((s, h) => s + (h.unfunded ?? 0), 0), 2)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showAdd && <AddHoldingModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
        IRR and MOIC are illustrative calculations based on recorded cash flows and current market values. All figures require advisor review. Changes to this session are not persisted in demo mode.
      </p>
    </>
  );
}
