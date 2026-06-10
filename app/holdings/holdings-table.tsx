"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  Trash2,
  Search,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import type { HoldingView } from "@/lib/data/holdings";
import { colorFor } from "@/lib/portfolio-math";
import { fmtMillions, fmtPct } from "@/lib/calculations";
import { StatusPill } from "@/components/status-pill";
import { Field, inputClass } from "@/components/form-controls";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";
type SortKey = keyof Pick<
  HoldingView,
  "name" | "assetClass" | "market" | "entityName" | "liquidity" | "manager" | "vintage" | "value" | "allocationPct" | "unfunded"
>;

interface Filters {
  search: string;
  assetClasses: string[];
  entities: string[];
  liquidity: string[];
  market: string; // "" | "Public" | "Private"
}

const ASSET_CLASS_OPTIONS = [
  "Cash & Reserves",
  "Fixed Income",
  "Public Equity",
  "Private Credit",
  "Real Assets",
  "Private Equity & Venture",
  "Direct / Operating",
];

const LIQUIDITY_OPTIONS = ["Daily", "Quarterly", "Annual", "Multi-Year", "Illiquid"];

const ENTITY_OPTIONS = [
  { id: "Atwater Holdings LLC", label: "Holdings LLC" },
  { id: "Atwater Family Trust", label: "Family Trust" },
  { id: "Atwater Investment Partnership LP", label: "Investment Partnership" },
];

const EMPTY_FILTERS: Filters = {
  search: "",
  assetClasses: [],
  entities: [],
  liquidity: [],
  market: "",
};

const BLANK_FORM = {
  name: "",
  assetClass: "Public Equity",
  market: "Public",
  entityName: "Atwater Holdings LLC",
  value: "",
  liquidity: "Daily",
  manager: "",
  vintage: "",
  mgmtFeePct: "0",
  commitment: "",
  unfunded: "",
  note: "",
};

// ── Sort helpers ─────────────────────────────────────────────────────────────

function sortRows(rows: HoldingView[], key: SortKey, dir: SortDir): HoldingView[] {
  return [...rows].sort((a, b) => {
    const av = a[key] ?? "";
    const bv = b[key] ?? "";
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
      if (!h.name.toLowerCase().includes(q) && !h.manager.toLowerCase().includes(q))
        return false;
    }
    if (f.assetClasses.length && !f.assetClasses.includes(h.assetClass)) return false;
    if (f.entities.length && !f.entities.includes(h.entityName)) return false;
    if (f.liquidity.length && !f.liquidity.includes(h.liquidity)) return false;
    if (f.market && h.market !== f.market) return false;
    return true;
  });
}

// ── Multi-select dropdown ────────────────────────────────────────────────────

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt],
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] transition-colors",
          selected.length
            ? "border-brand/40 bg-brand/8 text-brand"
            : "border-hairline bg-card text-ink-muted hover:border-brand/30 hover:text-ink",
        )}
      >
        {label}
        {selected.length ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
            {selected.length}
          </span>
        ) : null}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-20 min-w-[180px] rounded-xl border border-hairline bg-card shadow-lg">
            <ul className="py-1.5">
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => toggle(opt)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[12.5px] text-ink transition-colors hover:bg-secondary"
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
                        selected.includes(opt)
                          ? "border-brand bg-brand text-white"
                          : "border-hairline",
                      )}
                    >
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

// ── Add Holding modal ────────────────────────────────────────────────────────

function AddHoldingModal({
  onAdd,
  onClose,
}: {
  onAdd: (h: HoldingView) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(BLANK_FORM);
  const [error, setError] = useState("");

  const set = (k: keyof typeof BLANK_FORM, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return setError("Name is required.");
    const value = parseFloat(form.value);
    if (!isFinite(value) || value < 0) return setError("Value must be a positive number.");
    setError("");

    const id = `custom-${Date.now()}`;
    onAdd({
      id,
      name: form.name.trim(),
      assetClass: form.assetClass,
      market: form.market,
      entityName: form.entityName,
      liquidity: form.liquidity,
      value,
      allocationPct: 0, // recomputed by the table
      manager: form.manager.trim(),
      vintage: form.vintage.trim(),
      commitment: form.commitment ? parseFloat(form.commitment) : null,
      unfunded: form.unfunded ? parseFloat(form.unfunded) : null,
      contributions: null,
      distributions: null,
      account: "",
      structure: "",
      strategy: "",
      status: "Open",
      owners: [{ name: form.entityName, pct: 100 }],
      oversight: "External",
      note: form.note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-16 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-hairline bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="font-serif text-[18px] font-medium text-ink">Add holding</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-md border border-critical/30 bg-critical/5 px-3 py-2 text-[12.5px] text-critical">
              {error}
            </p>
          )}
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Blackrock Multi-Asset Fund"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Asset class">
              <select
                className={inputClass}
                value={form.assetClass}
                onChange={(e) => set("assetClass", e.target.value)}
              >
                {ASSET_CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Market">
              <select
                className={inputClass}
                value={form.market}
                onChange={(e) => set("market", e.target.value)}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Entity">
              <select
                className={inputClass}
                value={form.entityName}
                onChange={(e) => set("entityName", e.target.value)}
              >
                {ENTITY_OPTIONS.map((e) => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Liquidity">
              <select
                className={inputClass}
                value={form.liquidity}
                onChange={(e) => set("liquidity", e.target.value)}
              >
                {LIQUIDITY_OPTIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current value (USD)" hint="Enter full amount, e.g. 1500000">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                placeholder="1500000"
              />
            </Field>
            <Field label="Mgmt fee %">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.mgmtFeePct}
                onChange={(e) => set("mgmtFeePct", e.target.value)}
                placeholder="1.00"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Manager">
              <input
                className={inputClass}
                value={form.manager}
                onChange={(e) => set("manager", e.target.value)}
                placeholder="Fund manager name"
              />
            </Field>
            <Field label="Vintage">
              <input
                className={inputClass}
                value={form.vintage}
                onChange={(e) => set("vintage", e.target.value)}
                placeholder="e.g. 2024"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Commitment (optional)">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.commitment}
                onChange={(e) => set("commitment", e.target.value)}
                placeholder="e.g. 2000000"
              />
            </Field>
            <Field label="Unfunded (optional)">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.unfunded}
                onChange={(e) => set("unfunded", e.target.value)}
                placeholder="e.g. 500000"
              />
            </Field>
          </div>
          <Field label="Note (optional)">
            <textarea
              className={cn(inputClass, "resize-none")}
              rows={2}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Any relevant context for the advisor file"
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-hairline px-4 py-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-brand px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Add holding
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Column header ─────────────────────────────────────────────────────────────

function ColHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
  right,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey | null;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  right?: boolean;
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th
      className={cn(
        "cursor-pointer select-none whitespace-nowrap px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors",
        right ? "text-right" : "text-left",
        active ? "text-brand" : "text-ink-muted hover:text-ink",
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {right && <Icon className="h-3 w-3 opacity-60" />}
        {label}
        {!right && <Icon className="h-3 w-3 opacity-60" />}
      </span>
    </th>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

export function HoldingsTable({ initial }: { initial: HoldingView[] }) {
  const [rows, setRows] = useState<HoldingView[]>(initial);
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const totalAum = useMemo(() => rows.reduce((s, h) => s + h.value, 0), [rows]);

  const visible = useMemo(() => {
    const filtered = filterRows(rows, filters);
    return sortRows(filtered, sortKey, sortDir);
  }, [rows, filters, sortKey, sortDir]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else { setSortKey(key); setSortDir("desc"); }
    },
    [sortKey],
  );

  const handleAdd = useCallback((h: HoldingView) => {
    setRows((prev) => [h, ...prev]);
    setShowAdd(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setRows((prev) => prev.filter((h) => h.id !== id));
    setConfirmDelete(null);
  }, []);

  const setFilter = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const activeFilterCount =
    (filters.assetClasses.length > 0 ? 1 : 0) +
    (filters.entities.length > 0 ? 1 : 0) +
    (filters.liquidity.length > 0 ? 1 : 0) +
    (filters.market ? 1 : 0);

  const hasAnyFilter = !!filters.search || activeFilterCount > 0;

  const liquidityTone = (liq: string) =>
    liq === "Daily" ? "positive" : liq === "Illiquid" ? "critical" : "caution";

  // Unique entities from data
  const entityOptions = useMemo(
    () => [...new Set(rows.map((h) => h.entityName).filter(Boolean))],
    [rows],
  );

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted/60" />
            <input
              className="h-8 w-full rounded-lg border border-hairline bg-card pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-muted/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Search by name or manager…"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilter("search", "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] transition-colors",
              showFilters || activeFilterCount
                ? "border-brand/40 bg-brand/8 text-brand"
                : "border-hairline bg-card text-ink-muted hover:border-brand/30 hover:text-ink",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear all */}
          {hasAnyFilter && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] text-ink-muted transition-colors hover:text-critical"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}

          {/* Position count */}
          <span className="text-[12px] text-ink-muted">
            {visible.length === rows.length
              ? `${rows.length} positions`
              : `${visible.length} of ${rows.length} positions`}
          </span>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add holding
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-card px-4 py-3">
          <MultiSelect
            label="Asset class"
            options={ASSET_CLASS_OPTIONS}
            selected={filters.assetClasses}
            onChange={(v) => setFilter("assetClasses", v)}
          />
          <MultiSelect
            label="Entity"
            options={entityOptions}
            selected={filters.entities}
            onChange={(v) => setFilter("entities", v)}
          />
          <MultiSelect
            label="Liquidity"
            options={LIQUIDITY_OPTIONS}
            selected={filters.liquidity}
            onChange={(v) => setFilter("liquidity", v)}
          />
          {/* Market radio */}
          <div className="flex items-center gap-1 rounded-lg border border-hairline bg-secondary p-1">
            {(["", "Public", "Private"] as const).map((m) => (
              <button
                key={m || "all"}
                type="button"
                onClick={() => setFilter("market", m)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[12px] transition-colors",
                  filters.market === m
                    ? "bg-card font-medium text-brand shadow-sm"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {m || "All markets"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full min-w-[1100px] text-[13px]">
          <thead>
            <tr className="border-b border-hairline bg-secondary/60">
              <ColHeader label="Holding" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Asset class" sortKey="assetClass" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Market" sortKey="market" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Entity" sortKey="entityName" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Liquidity" sortKey="liquidity" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Manager" sortKey="manager" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Vintage" sortKey="vintage" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Value" sortKey="value" current={sortKey} dir={sortDir} onSort={handleSort} right />
              <ColHeader label="Weight" sortKey="allocationPct" current={sortKey} dir={sortDir} onSort={handleSort} right />
              <ColHeader label="Unfunded" sortKey="unfunded" current={sortKey} dir={sortDir} onSort={handleSort} right />
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {visible.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-[13px] text-ink-muted">
                  No positions match the current filters.
                </td>
              </tr>
            )}
            {visible.map((h) => {
              const weightPct = totalAum > 0 ? (h.value / totalAum) * 100 : 0;
              const isDeleting = confirmDelete === h.id;
              return (
                <tr
                  key={h.id}
                  className={cn(
                    "group transition-colors",
                    isDeleting ? "bg-critical/5" : "hover:bg-secondary/40",
                  )}
                >
                  {/* Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                        style={{ background: colorFor(h.assetClass) }}
                      />
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate font-medium text-ink">{h.name}</p>
                        {h.note && (
                          <p className="max-w-[220px] truncate text-[11px] text-ink-muted/70">
                            {h.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Asset class */}
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-block max-w-[150px] truncate rounded-full px-2 py-0.5 text-[11.5px] font-medium"
                      style={{
                        background: `${colorFor(h.assetClass)}18`,
                        color: colorFor(h.assetClass),
                      }}
                    >
                      {h.assetClass}
                    </span>
                  </td>
                  {/* Market */}
                  <td className="px-4 py-3.5 text-ink-muted">{h.market}</td>
                  {/* Entity */}
                  <td className="max-w-[140px] truncate px-4 py-3.5 text-ink-muted">
                    {h.entityName || "Managed Accounts"}
                  </td>
                  {/* Liquidity */}
                  <td className="px-4 py-3.5">
                    <StatusPill tone={liquidityTone(h.liquidity)} dot={false}>
                      {h.liquidity}
                    </StatusPill>
                  </td>
                  {/* Manager */}
                  <td className="max-w-[160px] truncate px-4 py-3.5 text-ink-muted">
                    {h.manager || "—"}
                  </td>
                  {/* Vintage */}
                  <td className="px-4 py-3.5 text-ink-muted">{h.vintage || "—"}</td>
                  {/* Value */}
                  <td className="tnum px-4 py-3.5 text-right font-medium text-ink">
                    {fmtMillions(h.value, 2)}
                  </td>
                  {/* Weight */}
                  <td className="tnum px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1 w-14 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(weightPct * 2.5, 100)}%`,
                            background: colorFor(h.assetClass),
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-ink">{fmtPct(weightPct, 1)}</span>
                    </div>
                  </td>
                  {/* Unfunded */}
                  <td className="tnum px-4 py-3.5 text-right text-ink-muted">
                    {h.unfunded ? fmtMillions(h.unfunded, 2) : "—"}
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-3.5">
                    {isDeleting ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(h.id)}
                          className="rounded-md bg-critical px-2 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-md border border-hairline px-2 py-1 text-[11px] text-ink-muted transition-colors hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(h.id)}
                        className="rounded-md p-1.5 text-transparent transition-colors group-hover:text-ink-muted hover:!text-critical"
                        aria-label={`Remove ${h.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Footer totals */}
          {visible.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-hairline bg-secondary/40">
                <td className="px-4 py-3 text-[12px] font-semibold text-ink" colSpan={7}>
                  {visible.length < rows.length ? `Filtered total (${visible.length} positions)` : `Total (${rows.length} positions)`}
                </td>
                <td className="tnum px-4 py-3 text-right text-[13px] font-semibold text-ink">
                  {fmtMillions(visible.reduce((s, h) => s + h.value, 0), 2)}
                </td>
                <td className="tnum px-4 py-3 text-right text-[12px] font-semibold text-ink">
                  {fmtPct(totalAum > 0 ? (visible.reduce((s, h) => s + h.value, 0) / totalAum) * 100 : 0, 1)}
                </td>
                <td className="tnum px-4 py-3 text-right text-[12px] font-semibold text-ink">
                  {fmtMillions(visible.reduce((s, h) => s + (h.unfunded ?? 0), 0), 2)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddHoldingModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
        All values are illustrative mock data. Changes made here affect this session only and
        are not persisted. Adding or removing a holding requires advisor and Investment
        Committee review.
      </p>
    </>
  );
}
