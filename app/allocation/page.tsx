import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { PolicyRangeBar } from "@/components/policy-range-bar";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getPolicyRanges } from "@/lib/data/allocations";
import { getActiveClient } from "@/lib/data/clients";
import { rangeRows, marketMixOf, breakdownBy, type RangeRow } from "@/lib/portfolio-math";
import { fmtPct, fmtSignedPct, fmtMillions } from "@/lib/calculations";

const STATUS_TONE: Record<RangeRow["status"], "positive" | "critical" | "caution"> = {
  "Within range": "positive",
  "Below range": "critical",
  "Above range": "caution",
};

const REVIEW_NOTE: Record<RangeRow["status"], string> = {
  "Within range": "Within the policy range. No action required.",
  "Below range": "Below the policy range — discussion point for the Investment Committee.",
  "Above range": "Above the policy range — advisor review required before adding exposure.",
};

export default async function AllocationPage() {
  const [holdings, ranges, client] = await Promise.all([
    getHoldingsDetailed(),
    getPolicyRanges(),
    getActiveClient(),
  ]);
  const rows = rangeRows(holdings, ranges);
  const mix = marketMixOf(holdings);
  const outOfRange = rows.filter((r) => r.status !== "Within range");
  // Classes held in the portfolio that have no policy range yet (e.g. a class
  // recently split out, like Venture Capital).
  const ranged = new Set(ranges.map((r) => r.assetClass));
  const unranged = breakdownBy(holdings, (h) => h.assetClass).filter(
    (c) => !ranged.has(c.label),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Allocation Discipline"
        title="Positioning against policy ranges"
        lede="Allocation is governed by ranges, not a single 'perfect' target. Each asset class is reviewed against its strategic band — variances become discussion points and review flags, never automatic trades."
        status={{ label: "Proposed Framework", tone: "info" }}
        client={{ name: client.name, asOf: client.asOf }}
      />

      {/* Public / private mix */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <Stat
            label="Public markets"
            value={fmtPct(mix.publicPct, 0)}
            sub={fmtMillions(mix.publicValue)}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Private markets"
            value={fmtPct(mix.privatePct, 0)}
            sub={fmtMillions(mix.privateValue)}
            tone="caution"
          />
        </Panel>
        <Panel className="flex flex-col justify-center p-5">
          <p className="eyebrow mb-2">Framework check</p>
          <StatusPill tone={outOfRange.length ? "caution" : "positive"}>
            {outOfRange.length
              ? `${outOfRange.length} class${outOfRange.length > 1 ? "es" : ""} outside policy range`
              : "All classes within policy ranges"}
          </StatusPill>
          <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
            {outOfRange.length
              ? "Each variance is a discussion point for the next Investment Committee."
              : "Positioning is consistent with the strategic asset allocation."}
          </p>
        </Panel>
      </div>

      {/* Allocation vs policy ranges */}
      <section>
        <SectionHeading
          eyebrow="Discipline"
          title="Asset class vs. policy range"
          description="Shaded band shows the strategic min–max; the tick marks target; the dot marks current positioning."
        />
        <Panel inset className="overflow-hidden">
          <div className="hidden grid-cols-[1.4fr_2fr_0.8fr_1.3fr] gap-4 border-b border-hairline px-6 py-3 lg:grid">
            <span className="eyebrow">Asset class</span>
            <span className="eyebrow">Position within range</span>
            <span className="eyebrow text-right">Current</span>
            <span className="eyebrow text-right">Status</span>
          </div>
          <ul className="divide-y divide-hairline">
            {rows.map((r) => (
              <li
                key={r.assetClass}
                className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[1.4fr_2fr_0.8fr_1.3fr] lg:items-center"
              >
                <div>
                  <p className="text-[14px] font-medium text-ink">{r.assetClass}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    Target {r.target}% · range {r.min}–{r.max}%
                  </p>
                </div>
                <div>
                  <PolicyRangeBar
                    current={r.current}
                    min={r.min}
                    target={r.target}
                    max={r.max}
                    status={r.status}
                  />
                </div>
                <div className="flex items-baseline gap-2 lg:block lg:text-right">
                  <p className="tnum text-[15px] font-medium text-ink">
                    {fmtPct(r.current)}
                  </p>
                  <p className="tnum text-[12px] text-ink-muted">
                    {fmtSignedPct(r.varianceFromTarget)} vs target
                  </p>
                </div>
                <div className="lg:text-right">
                  <StatusPill tone={STATUS_TONE[r.status]} dot={false}>
                    {r.status}
                  </StatusPill>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      {/* Classes without a policy range yet */}
      {unranged.length > 0 && (
        <section className="mt-8">
          <SectionHeading
            eyebrow="Policy gap"
            title="Classes without a policy range"
            description="Held in the portfolio but not yet covered by the strategic asset allocation — set a range with your advisor."
          />
          <Panel inset>
            <ul className="divide-y divide-hairline">
              {unranged.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="text-[14px] font-medium text-ink">{c.label}</p>
                    <p className="text-[12px] text-ink-muted">{c.count} positions</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="tnum text-[14px] font-medium text-ink">
                      {fmtPct(c.pct)} · {fmtMillions(c.value)}
                    </p>
                    <StatusPill tone="caution" dot={false}>
                      No policy range
                    </StatusPill>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {/* Discussion points */}
      {outOfRange.length > 0 && (
        <section className="mt-8">
          <SectionHeading eyebrow="For review" title="Discussion points" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {outOfRange.map((r) => (
              <Panel key={r.assetClass} className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[14px] font-medium text-ink">{r.assetClass}</p>
                  <StatusPill tone={STATUS_TONE[r.status]} dot={false}>
                    {r.status}
                  </StatusPill>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-muted">
                  Currently {fmtPct(r.current)} against a {r.min}–{r.max}% range.{" "}
                  {REVIEW_NOTE[r.status]}
                </p>
              </Panel>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Policy ranges reflect the strategic asset allocation under review with the
        family. Nothing here is investment advice or a recommendation to buy or sell.
        Any rebalancing is a governance decision requiring advisor and committee review.
      </p>
    </div>
  );
}
