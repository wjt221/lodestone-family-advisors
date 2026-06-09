import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel, PanelHeader } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import {
  liquidityReserve,
  liquidityCoverage,
  totalUnfunded,
  fmtMillions,
  fmtPct,
} from "@/lib/calculations";
import { LIQUIDITY_NEEDS, CAPITAL_CALLS } from "@/lib/mock-data";

const SEG = [
  { key: "reserve", label: "Cash reserve", color: "var(--positive)" },
  { key: "fixed", label: "Fixed income", color: "var(--info)" },
  { key: "equity", label: "Public equity", color: "var(--caution)" },
] as const;

export default function LiquidityPage() {
  const reserve = liquidityReserve();
  const coverage = liquidityCoverage();

  return (
    <div>
      <PageHeader
        eyebrow="Liquidity Discipline"
        title="Coverage that prevents forced selling"
        lede="Liquidity planning is how Lodestone keeps the family from selling long-horizon assets at the wrong time. We map forward obligations against the sources available to meet them, by reliability of access."
        status={{ label: "Discussion Point", tone: "info" }}
      />

      {/* Reserve status */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Dedicated reserve"
            value={fmtMillions(reserve.reserve)}
            sub={`${fmtPct(reserve.pct)} of AUM`}
            tone="critical"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Policy reserve floor"
            value={`${reserve.min}–${reserve.max}%`}
            sub={`Target ${reserve.target}%`}
          />
        </Panel>
        <Panel className="p-5">
          <p className="eyebrow mb-2">Reserve status</p>
          <StatusPill>{reserve.status}</StatusPill>
          <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
            Reserve sits below the proposed floor. Review before new illiquid
            commitments.
          </p>
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Unfunded commitments"
            value={fmtMillions(totalUnfunded())}
            sub="Across 3 private funds"
            tone="caution"
          />
        </Panel>
      </div>

      {/* Coverage by horizon */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Forward coverage"
          title="Obligations vs. sources, by horizon"
          description="Each bar represents that horizon's total obligations, filled by the sources available to meet them. Reaching into public equity signals potential forced-selling risk."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {coverage.map((h) => {
            const segReserve = h.reserveCover;
            const segFixed = h.liquidCover - h.reserveCover;
            const segEquity = Math.max(0, h.need - h.liquidCover);
            const widths = {
              reserve: (segReserve / h.need) * 100,
              fixed: (segFixed / h.need) * 100,
              equity: (segEquity / h.need) * 100,
            };
            const needsEquity = segEquity > 0;
            return (
              <Panel key={h.horizon} className="p-5">
                <div className="mb-1 flex items-baseline justify-between">
                  <h3 className="font-serif text-[17px] font-medium text-ink">
                    {h.horizon}
                  </h3>
                  <span className="tnum text-[13px] font-medium text-ink-muted">
                    {h.coverageRatio.toFixed(1)}× liquid
                  </span>
                </div>
                <p className="tnum mb-4 text-[13px] text-ink-muted">
                  {fmtMillions(h.need)} of obligations
                </p>

                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    style={{ width: `${widths.reserve}%`, background: SEG[0].color }}
                  />
                  <div
                    style={{ width: `${widths.fixed}%`, background: SEG[1].color }}
                  />
                  <div
                    style={{ width: `${widths.equity}%`, background: SEG[2].color }}
                  />
                </div>

                <div className="mt-4">
                  <StatusPill tone={needsEquity ? "caution" : "positive"} dot={false}>
                    {needsEquity
                      ? "Requires public equity"
                      : "Covered by reserve + fixed income"}
                  </StatusPill>
                  {needsEquity && (
                    <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                      Meeting this horizon would require drawing on public equity —
                      a behavioral risk to manage in a drawdown.
                    </p>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {SEG.map((s) => (
            <span key={s.key} className="flex items-center gap-2 text-[12px] text-ink-muted">
              <span
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </section>

      {/* Obligations & capital calls */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel inset>
          <div className="px-6 pt-6">
            <PanelHeader
              title="Forward obligations"
              description="Cumulative, by horizon."
            />
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-y border-hairline">
                <th className="px-6 py-2.5 text-left font-medium text-ink-muted">
                  Obligation
                </th>
                <th className="tnum px-3 py-2.5 text-right font-medium text-ink-muted">
                  12-mo
                </th>
                <th className="tnum px-3 py-2.5 text-right font-medium text-ink-muted">
                  24-mo
                </th>
                <th className="tnum px-6 py-2.5 text-right font-medium text-ink-muted">
                  36-mo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {LIQUIDITY_NEEDS.map((n) => (
                <tr key={n.id}>
                  <td className="px-6 py-3">
                    <p className="font-medium text-ink">{n.label}</p>
                    <p className="text-[11.5px] text-ink-muted">{n.description}</p>
                  </td>
                  <td className="tnum px-3 py-3 text-right text-ink">
                    {fmtMillions(n.m12, 2)}
                  </td>
                  <td className="tnum px-3 py-3 text-right text-ink">
                    {fmtMillions(n.m24, 2)}
                  </td>
                  <td className="tnum px-6 py-3 text-right text-ink">
                    {fmtMillions(n.m36, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-hairline bg-secondary/40">
                <td className="px-6 py-3 font-medium text-ink">Total</td>
                {(["m12", "m24", "m36"] as const).map((k, i) => (
                  <td
                    key={k}
                    className={`tnum py-3 text-right font-semibold text-ink ${
                      i === 2 ? "px-6" : "px-3"
                    }`}
                  >
                    {fmtMillions(
                      LIQUIDITY_NEEDS.reduce((s, n) => s + n[k], 0),
                      2,
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </Panel>

        <Panel inset>
          <div className="px-6 pt-6">
            <PanelHeader
              title="Capital call planning"
              description="Unfunded commitments and expected drawdown windows."
            />
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-y border-hairline">
                <th className="px-6 py-2.5 text-left font-medium text-ink-muted">
                  Fund
                </th>
                <th className="tnum px-3 py-2.5 text-right font-medium text-ink-muted">
                  Unfunded
                </th>
                <th className="px-6 py-2.5 text-right font-medium text-ink-muted">
                  Window
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {CAPITAL_CALLS.map((c) => (
                <tr key={c.fund}>
                  <td className="px-6 py-3">
                    <p className="font-medium text-ink">{c.fund}</p>
                    <p className="tnum text-[11.5px] text-ink-muted">
                      {fmtMillions(c.called, 2)} of {fmtMillions(c.commitment, 1)}{" "}
                      called
                    </p>
                  </td>
                  <td className="tnum px-3 py-3 text-right font-medium text-ink">
                    {fmtMillions(c.unfunded, 2)}
                  </td>
                  <td className="px-6 py-3 text-right text-[12px] text-ink-muted">
                    {c.expectedWindow}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Liquidity figures, obligations, and call windows are illustrative and for
        discussion only. This is not investment advice. Reserve sizing and any
        portfolio changes require advisor and Investment Committee review.
      </p>
    </div>
  );
}
