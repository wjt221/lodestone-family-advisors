import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel, PanelHeader } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { getHoldingsDetailed, canWriteHoldings } from "@/lib/data/holdings";
import { getActiveClient } from "@/lib/data/clients";
import { EditHolding } from "./edit-holding";
import {
  breakdownBy,
  marketMixOf,
  illiquidPctOf,
  totalValue,
  totalUnfundedOf,
  totalCommitmentOf,
  ownerLookThrough,
  colorFor,
  type BreakdownRow,
} from "@/lib/portfolio-math";
import { fmtMillions, fmtPct } from "@/lib/calculations";

function BreakdownList({ rows }: { rows: BreakdownRow[] }) {
  const max = Math.max(...rows.map((r) => r.pct), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-ink">{r.label}</span>
            <span className="tnum shrink-0 text-[12.5px] text-ink-muted">
              {fmtPct(r.pct)} · {fmtMillions(r.value, 2)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.pct / max) * 100}%`, background: r.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const liquidityTone = (liq: string) =>
  liq === "Daily" ? "positive" : liq === "Illiquid" ? "critical" : "caution";

export default async function PortfolioPage() {
  const [holdings, client, canWrite] = await Promise.all([
    getHoldingsDetailed(),
    getActiveClient(),
    canWriteHoldings(),
  ]);

  const total = totalValue(holdings);
  const mix = marketMixOf(holdings);
  const unfunded = totalUnfundedOf(holdings);
  const byClass = breakdownBy(holdings, (h) => h.assetClass);
  const byLiquidity = breakdownBy(holdings, (h) => h.liquidity);
  const byEntity = breakdownBy(holdings, (h) => h.entityName || "Managed Accounts");
  const byOwner = ownerLookThrough(holdings).map((o) => ({
    label: o.owner,
    value: o.value,
    pct: o.pct,
    count: o.positions,
    color: o.color,
  }));
  const byStrategy = breakdownBy(holdings, (h) => h.strategy).slice(0, 10);
  const byStructure = breakdownBy(holdings, (h) => h.structure).slice(0, 10);
  const byManager = breakdownBy(holdings, (h) => h.manager).slice(0, 10);

  const unfundedHoldings = holdings
    .filter((h) => (h.unfunded ?? 0) > 0)
    .sort((a, b) => (b.unfunded ?? 0) - (a.unfunded ?? 0));

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio Oversight"
        title="Review portfolio alignment"
        lede="Oversight, not a tracker. The same capital seen through several lenses — asset class, liquidity, entity, strategy, and structure — so the family can see how the portfolio is actually shaped."
        status={{ label: "Discussion Point", tone: "info" }}
        client={{ name: client.name, asOf: client.asOf }}
      />

      {/* Summary band */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Total investments"
            value={fmtMillions(total)}
            sub={`${holdings.length} positions`}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Public / private"
            value={`${fmtPct(mix.publicPct, 0)} / ${fmtPct(mix.privatePct, 0)}`}
            sub="By market"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Illiquid exposure"
            value={fmtPct(illiquidPctOf(holdings), 0)}
            sub="Multi-year and illiquid"
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Unfunded"
            value={fmtMillions(unfunded)}
            sub={`Of ${fmtMillions(totalCommitmentOf(holdings))} committed`}
            tone="caution"
          />
        </Panel>
      </div>

      {/* Lenses */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Exposure"
          title="The same capital, seven ways"
          description="Asset class, liquidity, owner, entity, strategy, structure, and manager — each answers a different oversight question."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel>
            <PanelHeader title="By asset class" />
            <BreakdownList rows={byClass} />
          </Panel>
          <Panel>
            <PanelHeader title="By owner (look-through)" />
            <BreakdownList rows={byOwner} />
          </Panel>
          <Panel>
            <PanelHeader title="By liquidity" />
            <BreakdownList rows={byLiquidity} />
          </Panel>
          <Panel>
            <PanelHeader title="By entity / household" />
            <BreakdownList rows={byEntity} />
          </Panel>
          <Panel>
            <PanelHeader title="By strategy" />
            <BreakdownList rows={byStrategy} />
          </Panel>
          <Panel>
            <PanelHeader title="By structure" />
            <BreakdownList rows={byStructure} />
          </Panel>
          <Panel>
            <PanelHeader title="By manager / sponsor" />
            <BreakdownList rows={byManager} />
          </Panel>
        </div>
      </section>

      {/* Holdings table */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Holdings"
          title="All positions"
          description="Sorted by market value. Commitments and unfunded amounts come from the schedule of alternative investments."
        />
        <Panel inset className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {["Holding", "Asset class", "Strategy", "Entity", "Liquidity", "Value", "Weight", "Unfunded"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 font-medium text-ink-muted ${
                        i >= 5 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
                {canWrite ? <th className="px-3 py-3" aria-label="Edit" /> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {holdings.map((h) => (
                <tr key={h.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                        style={{ background: colorFor(h.assetClass) }}
                      />
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-medium text-ink">{h.name}</p>
                        <p className="max-w-[260px] truncate text-[11.5px] text-ink-muted">
                          {h.manager}
                          {h.structure ? ` · ${h.structure}` : ""}
                          {h.vintage ? ` · ${h.vintage}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">{h.assetClass}</td>
                  <td className="px-5 py-3.5 text-ink-muted">{h.strategy || "—"}</td>
                  <td className="max-w-[140px] truncate px-5 py-3.5 text-ink-muted">
                    {h.entityName || "Managed Accounts"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill tone={liquidityTone(h.liquidity)} dot={false}>
                      {h.liquidity}
                    </StatusPill>
                  </td>
                  <td className="tnum px-5 py-3.5 text-right font-medium text-ink">
                    {fmtMillions(h.value, 2)}
                  </td>
                  <td className="tnum px-5 py-3.5 text-right text-ink">
                    {fmtPct(total ? (h.value / total) * 100 : 0, 1)}
                  </td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-muted">
                    {h.unfunded ? fmtMillions(h.unfunded, 2) : "—"}
                  </td>
                  {canWrite ? (
                    <td className="px-3 py-3.5">
                      <EditHolding
                        holding={{
                          id: h.id,
                          name: h.name,
                          value: h.value,
                          assetClass: h.assetClass,
                          strategy: h.strategy,
                          liquidity: h.liquidity,
                        }}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      {/* Unfunded commitments */}
      <section>
        <SectionHeading
          eyebrow="For review"
          title="Unfunded commitments"
          description="Future capital calls the liquidity reserve must be able to meet."
        />
        <Panel inset className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {["Holding", "Entity", "Committed", "Contributed", "Unfunded"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 font-medium text-ink-muted ${i >= 2 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {unfundedHoldings.map((h) => (
                <tr key={h.id}>
                  <td className="max-w-[280px] truncate px-5 py-3 font-medium text-ink">{h.name}</td>
                  <td className="px-5 py-3 text-ink-muted">{h.entityName || "Managed Accounts"}</td>
                  <td className="tnum px-5 py-3 text-right text-ink-muted">
                    {h.commitment ? fmtMillions(h.commitment, 2) : "—"}
                  </td>
                  <td className="tnum px-5 py-3 text-right text-ink-muted">
                    {h.contributions ? fmtMillions(h.contributions, 2) : "—"}
                  </td>
                  <td className="tnum px-5 py-3 text-right font-medium text-caution">
                    {fmtMillions(h.unfunded ?? 0, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Values reflect the most recent statements and manager marks available and may
        lag current market values. Nothing here is investment advice. Portfolio
        changes require advisor and Investment Committee review.
      </p>
    </div>
  );
}
