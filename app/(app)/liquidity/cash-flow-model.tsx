"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";
import { Field, inputClass } from "@/components/form-controls";
import { fmtMillions } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export interface CapitalAccountInput {
  /** Capital account / entity name. */
  name: string;
  /** Daily + quarterly accessible balance today. */
  liquid: number;
  /** Unfunded commitments callable by managers. */
  unfunded: number;
  /** Trailing-year distributions + income — the starting income run-rate. */
  annualIncome: number;
}

interface Props {
  accounts: CapitalAccountInput[];
  startYear: number;
}

interface Assumptions {
  incomeGrowthPct: number; // yearly growth applied to the distribution run-rate
  yieldOnLiquidPct: number; // yield earned on the liquid balance
  callYr1Pct: number; // share of unfunded called in year 1
  callYr2Pct: number;
  callYr3Pct: number;
  annualSpending: number; // family draw / planned outflows per year
}

const DEFAULTS: Assumptions = {
  incomeGrowthPct: 3,
  yieldOnLiquidPct: 4,
  callYr1Pct: 50,
  callYr2Pct: 30,
  callYr3Pct: 20,
  annualSpending: 0,
};

interface YearRow {
  year: number;
  opening: number;
  income: number;
  yieldEarned: number;
  calls: number;
  spending: number;
  closing: number;
}

function project(account: CapitalAccountInput, a: Assumptions, startYear: number): YearRow[] {
  const callSchedule = [a.callYr1Pct, a.callYr2Pct, a.callYr3Pct, 0, 0];
  const rows: YearRow[] = [];
  let opening = account.liquid;
  let income = account.annualIncome;

  for (let i = 0; i < 5; i++) {
    const calls = account.unfunded * (callSchedule[i] / 100);
    const yieldEarned = Math.max(opening, 0) * (a.yieldOnLiquidPct / 100);
    const closing = opening + income + yieldEarned - calls - a.annualSpending;
    rows.push({
      year: startYear + i,
      opening,
      income,
      yieldEarned,
      calls,
      spending: a.annualSpending,
      closing,
    });
    opening = closing;
    income = income * (1 + a.incomeGrowthPct / 100);
  }
  return rows;
}

const money = (v: number) =>
  v < 0 ? `(${fmtMillions(Math.abs(v), 2)})` : fmtMillions(v, 2);

function NumInput({
  label, value, onChange, suffix, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string; step?: number;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type="number"
          step={step}
          className={cn(inputClass, suffix && "pr-8")}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-ink-muted">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

export function CashFlowModel({ accounts, startYear }: Props) {
  const [selected, setSelected] = useState<string>("__all__");
  const [a, setA] = useState<Assumptions>(DEFAULTS);
  const set = (k: keyof Assumptions, v: number) => setA((prev) => ({ ...prev, [k]: v }));

  const allFamily: CapitalAccountInput = useMemo(
    () => ({
      name: "All family",
      liquid: accounts.reduce((s, x) => s + x.liquid, 0),
      unfunded: accounts.reduce((s, x) => s + x.unfunded, 0),
      annualIncome: accounts.reduce((s, x) => s + x.annualIncome, 0),
    }),
    [accounts],
  );

  const active = selected === "__all__"
    ? allFamily
    : accounts.find((x) => x.name === selected) ?? allFamily;

  const rows = useMemo(() => project(active, a, startYear), [active, a, startYear]);
  const shortfallYear = rows.find((r) => r.closing < 0)?.year ?? null;
  const callTotalPct = a.callYr1Pct + a.callYr2Pct + a.callYr3Pct;

  return (
    <div>
      {/* Account selector */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelected("__all__")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors",
            selected === "__all__"
              ? "border-brand bg-brand-soft text-ink"
              : "border-hairline text-ink-muted hover:text-ink",
          )}
        >
          All family
        </button>
        {accounts.map((acct) => (
          <button
            key={acct.name}
            type="button"
            onClick={() => setSelected(acct.name)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors",
              selected === acct.name
                ? "border-brand bg-brand-soft text-ink"
                : "border-hairline text-ink-muted hover:text-ink",
            )}
          >
            {acct.name}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Assumptions */}
        <Panel className="h-fit p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink">Assumptions</h3>
            <StatusPill tone="caution" dot={false}>Proposed Framework</StatusPill>
          </div>
          <div className="space-y-3.5">
            <NumInput label="Income growth / yr" value={a.incomeGrowthPct} onChange={(v) => set("incomeGrowthPct", v)} suffix="%" step={0.5} />
            <NumInput label="Yield on liquid" value={a.yieldOnLiquidPct} onChange={(v) => set("yieldOnLiquidPct", v)} suffix="%" step={0.25} />
            <NumInput label={`Calls funded ${startYear}`} value={a.callYr1Pct} onChange={(v) => set("callYr1Pct", v)} suffix="%" step={5} />
            <NumInput label={`Calls funded ${startYear + 1}`} value={a.callYr2Pct} onChange={(v) => set("callYr2Pct", v)} suffix="%" step={5} />
            <NumInput label={`Calls funded ${startYear + 2}`} value={a.callYr3Pct} onChange={(v) => set("callYr3Pct", v)} suffix="%" step={5} />
            <NumInput label="Family draw / yr (USD)" value={a.annualSpending} onChange={(v) => set("annualSpending", v)} step={100000} />
          </div>
          {callTotalPct !== 100 && (
            <p className="mt-3 text-[11.5px] leading-relaxed text-caution">
              Call schedule totals {callTotalPct}% of unfunded — remainder assumed uncalled in this window.
            </p>
          )}
          <div className="mt-4 space-y-1.5 border-t border-hairline pt-3.5 text-[11.5px] text-ink-muted">
            <p className="flex justify-between"><span>Liquid today</span><span className="tnum text-ink">{fmtMillions(active.liquid, 2)}</span></p>
            <p className="flex justify-between"><span>Unfunded</span><span className="tnum text-ink">{fmtMillions(active.unfunded, 2)}</span></p>
            <p className="flex justify-between"><span>Income run-rate</span><span className="tnum text-ink">{fmtMillions(active.annualIncome, 2)}/yr</span></p>
          </div>
        </Panel>

        {/* Projection table */}
        <div>
          {shortfallYear && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-critical/25 bg-critical-soft px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-critical" />
              <p className="text-[12.5px] leading-relaxed text-critical">
                Under these assumptions, {active.name === "All family" ? "the family's" : `${active.name}'s`} liquid
                balance goes negative in {shortfallYear}. A topic for advisor discussion — e.g. distribution timing,
                call pacing, or a liquidity reserve.
              </p>
            </div>
          )}

          <Panel inset className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13px]">
              <thead>
                <tr className="border-b border-hairline">
                  {["Year", "Opening liquid", "Distributions + income", "Yield on liquid", "Capital calls", "Family draw", "Closing available"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 font-medium text-ink-muted ${i >= 1 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rows.map((r) => (
                  <tr key={r.year} className="transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3.5 font-medium text-ink">{r.year}</td>
                    <td className="tnum px-4 py-3.5 text-right text-ink-muted">{money(r.opening)}</td>
                    <td className="tnum px-4 py-3.5 text-right text-positive">+{fmtMillions(r.income, 2)}</td>
                    <td className="tnum px-4 py-3.5 text-right text-positive">+{fmtMillions(r.yieldEarned, 2)}</td>
                    <td className="tnum px-4 py-3.5 text-right text-ink">{r.calls > 0 ? `(${fmtMillions(r.calls, 2)})` : "—"}</td>
                    <td className="tnum px-4 py-3.5 text-right text-ink">{r.spending > 0 ? `(${fmtMillions(r.spending, 2)})` : "—"}</td>
                    <td className={cn(
                      "tnum px-4 py-3.5 text-right font-semibold",
                      r.closing < 0 ? "text-critical" : "text-ink",
                    )}>
                      {money(r.closing)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
            Illustrative projection. Distribution and income figures start from the trailing-year run-rate and grow at
            the assumed rate; actual cash flows depend on manager and business decisions. Prepared as a framework for
            advisor discussion — not a forecast and not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
