import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel, PanelHeader } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { HOLDINGS, ENTITIES, classColor } from "@/lib/mock-data";
import {
  allocationByClass,
  allocationByLiquidity,
  allocationByEntity,
  concentrationWatchlist,
  marketMix,
  illiquidPct,
  totalUnfunded,
  blendedFeePct,
  estAnnualFees,
  fmtMillions,
  fmtPct,
} from "@/lib/calculations";

const ENTITY_NAME = new Map(ENTITIES.map((e) => [e.id, e.name]));

function BreakdownList({
  rows,
}: {
  rows: { label: string; pct: number; value: number; color?: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.pct));
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
              style={{
                width: `${(r.pct / max) * 100}%`,
                background: r.color ?? "var(--brand)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function PortfolioPage() {
  const mix = marketMix();
  const concentration = concentrationWatchlist();
  const unfunded = HOLDINGS.filter((h) => (h.unfunded ?? 0) > 0);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio Oversight"
        title="Review portfolio alignment"
        lede="Oversight, not a tracker. The same capital seen through several lenses — asset class, liquidity, entity, and concentration — so the family can see how the portfolio is actually shaped."
        status={{ label: "Discussion Point", tone: "info" }}
      />

      {/* Summary band */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat label="Total AUM" value={fmtMillions(47_300_000)} sub="8 holdings" />
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
            value={fmtPct(illiquidPct(), 0)}
            sub="Multi-year and illiquid"
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Unfunded"
            value={fmtMillions(totalUnfunded())}
            sub="Future capital calls"
            tone="caution"
          />
        </Panel>
      </div>

      {/* Holdings table */}
      <section className="mb-10">
        <SectionHeading eyebrow="Holdings" title="All positions" />
        <Panel inset className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {["Holding", "Asset class", "Entity", "Liquidity", "Value", "Weight", "Unfunded"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 font-medium text-ink-muted ${
                        i >= 4 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {HOLDINGS.map((h) => (
                <tr key={h.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                        style={{ background: classColor(h.assetClass) }}
                      />
                      <div>
                        <p className="font-medium text-ink">{h.name}</p>
                        <p className="text-[11.5px] text-ink-muted">{h.manager}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">{h.assetClass}</td>
                  <td className="px-5 py-3.5 text-ink-muted">
                    {ENTITY_NAME.get(h.entity)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill
                      tone={
                        h.liquidity === "Daily"
                          ? "positive"
                          : h.liquidity === "Illiquid"
                            ? "critical"
                            : "caution"
                      }
                      dot={false}
                    >
                      {h.liquidity}
                    </StatusPill>
                  </td>
                  <td className="tnum px-5 py-3.5 text-right font-medium text-ink">
                    {fmtMillions(h.value, 2)}
                  </td>
                  <td className="tnum px-5 py-3.5 text-right text-ink">
                    {fmtPct(h.allocationPct, 0)}
                  </td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-muted">
                    {h.unfunded ? fmtMillions(h.unfunded, 2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      {/* Lenses */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Lenses"
          title="The same capital, four ways"
          description="Asset class, liquidity, market, and entity — each answers a different oversight question."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel>
            <PanelHeader title="By asset class" />
            <BreakdownList
              rows={allocationByClass().map((c) => ({
                label: c.assetClass,
                pct: c.pct,
                value: c.value,
                color: c.color,
              }))}
            />
          </Panel>
          <Panel>
            <PanelHeader title="By liquidity" />
            <BreakdownList
              rows={allocationByLiquidity().map((b) => ({
                label: b.bucket,
                pct: b.pct,
                value: b.value,
              }))}
            />
          </Panel>
          <Panel>
            <PanelHeader title="By entity" />
            <BreakdownList
              rows={allocationByEntity().map((e) => ({
                label: e.name,
                pct: e.pct,
                value: e.holdingsValue,
              }))}
            />
          </Panel>
        </div>
      </section>

      {/* Watch items */}
      <section>
        <SectionHeading
          eyebrow="For review"
          title="Watch items & discussion points"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel>
            <PanelHeader title="Concentration watchlist" />
            <ul className="space-y-3">
              {concentration.map((c) => (
                <li key={c.name} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {c.name}
                    </p>
                    <p className="text-[11.5px] text-ink-muted">{c.note}</p>
                  </div>
                  <span className="tnum shrink-0 text-[13px] font-medium text-ink">
                    {fmtPct(c.pct, 0)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Unfunded commitments" />
            <ul className="space-y-3">
              {unfunded.map((h) => (
                <li key={h.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {h.name}
                    </p>
                    <p className="tnum text-[11.5px] text-ink-muted">
                      {fmtMillions(h.commitment ?? 0, 1)} committed
                    </p>
                  </div>
                  <span className="tnum shrink-0 text-[13px] font-medium text-caution">
                    {fmtMillions(h.unfunded ?? 0, 2)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Cash & fee efficiency" />
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[13px] text-ink-muted">Blended management fee</p>
                  <span className="tnum text-[13px] font-medium text-ink">
                    {fmtPct(blendedFeePct(), 2)}
                  </span>
                </div>
                <p className="tnum text-[11.5px] text-ink-muted">
                  ≈ {fmtMillions(estAnnualFees(), 2)} per year, asset-weighted
                </p>
              </div>
              <div className="border-t border-hairline pt-3">
                <StatusPill tone="info">Discussion Point</StatusPill>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                  The reserve sits below policy while $7.1M is held in municipals.
                  Whether reserve sizing and short-duration positioning are optimally
                  structured for both access and yield is a point for advisor review.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        All holdings, weights, fees, and commitments are illustrative mock data.
        Nothing here is investment advice. Portfolio changes require advisor and
        Investment Committee review.
      </p>
    </div>
  );
}
