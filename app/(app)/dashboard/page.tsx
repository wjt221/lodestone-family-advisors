import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel, PanelHeader } from "@/components/panel";
import { Stat, MetricRow } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { AllocationChart } from "@/components/allocation-chart";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getActiveClient, getEntities } from "@/lib/data/clients";
import { getPolicyRanges } from "@/lib/data/allocations";
import { getPerformance } from "@/lib/data/performance";
import { getMeetings } from "@/lib/data/meetings";
import { getRiskRegister } from "@/lib/data/risk";
import { getClientIPS } from "@/lib/data/ips";
import { STATUS_LABELS } from "@/lib/ips/ipsDefaults";
import {
  breakdownBy,
  marketMixOf,
  illiquidPctOf,
  totalValue,
  totalUnfundedOf,
  rangeRows,
} from "@/lib/portfolio-math";
import { fmtMillions, fmtPct, fmtSignedPct } from "@/lib/calculations";

const pct = (v: number | null, digits = 1) =>
  v == null ? "—" : `${(v * 100).toFixed(digits)}%`;

export default async function DashboardPage() {
  const [holdings, client, entities, ranges, performance, meetings, risks, ips] =
    await Promise.all([
      getHoldingsDetailed(),
      getActiveClient(),
      getEntities(),
      getPolicyRanges(),
      getPerformance(),
      getMeetings(),
      getRiskRegister(),
      getClientIPS(),
    ]);

  const total = totalValue(holdings);
  const mix = marketMixOf(holdings);
  const unfunded = totalUnfundedOf(holdings);
  const byClass = breakdownBy(holdings, (h) => h.assetClass);
  const outOfRange = rangeRows(holdings, ranges).filter((r) => r.status !== "Within range");

  const totalPerf = performance.find((p) => p.scope === "total") ?? null;
  const vsExpected =
    totalPerf?.returnNet != null && totalPerf?.expectedReturn != null
      ? totalPerf.returnNet - totalPerf.expectedReturn
      : null;

  // Net worth = investment portfolio + business ownership held outside it.
  const businessOutside =
    performance.find((p) => p.scope === "other" && /business/i.test(p.label))?.amount ?? 0;
  const netWorth = total + businessOutside;

  const byEntity = breakdownBy(holdings, (h) => h.entityName || "Managed Accounts");
  const businessHoldings = holdings
    .filter((h) => /operating|business/i.test(h.structure) || /operating business|construction/i.test(h.strategy))
    .sort((a, b) => b.value - a.value);

  const cashValue = holdings
    .filter((h) => /cash/i.test(h.assetClass) || h.liquidity === "Daily")
    .reduce((s, h) => s + h.value, 0);
  const callCoverage = unfunded > 0 ? cashValue / unfunded : null;

  const topPositions = [...holdings]
    .filter((h) => !/managed accounts/i.test(h.name))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const elevatedRisks = risks.filter((r) => r.severity === "Elevated");
  const nextMeeting = meetings.find((m) => m.status === "Scheduled") ?? null;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="What needs attention this quarter"
        lede={`A working view of ${client.name} — net worth, exposure, liquidity, risk, and the decisions in front of the family. Every figure is prepared for advisor review.`}
        status={{ label: "Advisor Review Required", tone: "critical" }}
        client={{ name: client.name, asOf: client.asOf }}
      />

      {/* ── Net worth at a glance ─────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Total net worth"
            value={fmtMillions(netWorth)}
            sub={
              businessOutside > 0
                ? `${fmtMillions(total)} investments · ${fmtMillions(businessOutside)} business`
                : entities.length
                  ? `Across ${entities.length} entities`
                  : `${holdings.length} positions`
            }
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Return · net IRR"
            value={pct(totalPerf?.returnNet ?? null)}
            sub={
              vsExpected != null
                ? `${fmtSignedPct(vsExpected * 100)} vs expected`
                : "Since inception"
            }
            tone={vsExpected == null || vsExpected >= 0 ? "positive" : "caution"}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Private markets"
            value={fmtPct(mix.privatePct, 0)}
            sub={`Illiquid ${fmtPct(illiquidPctOf(holdings), 0)}`}
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Unfunded commitments"
            value={fmtMillions(unfunded)}
            sub="Future capital calls"
            tone="caution"
          />
        </Panel>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Asset allocation"
            description="By asset class, share of total investments."
            action={
              <Link
                href="/allocation"
                className="flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
              >
                Allocation discipline <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
            <AllocationChart
              height={240}
              slices={byClass.map((c) => ({
                label: c.label,
                pct: c.pct,
                value: c.value,
                color: c.color,
              }))}
              centerLabel="Total"
              centerValue={fmtMillions(total)}
            />
            <ul className="space-y-1.5">
              {byClass.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between gap-3 py-1"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                      style={{ background: c.color }}
                    />
                    <span className="truncate text-[13px] text-ink">{c.label}</span>
                  </span>
                  <span className="tnum shrink-0 text-[13px] font-medium text-ink">
                    {fmtPct(c.pct)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Performance snapshot"
            description="Net since-inception IRR vs the expected-return framework."
          />
          <div className="space-y-3">
            {performance
              .filter((p) => p.scope === "asset_class")
              .slice(0, 7)
              .map((p) => {
                const delta =
                  p.returnNet != null && p.expectedReturn != null
                    ? p.returnNet - p.expectedReturn
                    : null;
                return (
                  <div key={p.label} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="truncate text-ink">{p.label}</span>
                    <span className="tnum flex shrink-0 items-baseline gap-2">
                      <span className="font-medium text-ink">{pct(p.returnNet)}</span>
                      <span className={delta != null && delta < 0 ? "text-caution" : "text-positive"}>
                        {delta != null ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%` : ""}
                      </span>
                    </span>
                  </div>
                );
              })}
          </div>
          <Link
            href="/performance"
            className="mt-4 flex items-center gap-1 border-t border-hairline pt-3 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            Full performance review <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>
      </div>

      {/* ── Family balance sheet ──────────────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Net worth"
          title="The family balance sheet"
          description="Where the wealth is held — by capital account, plus directly held business interests."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="By capital account" />
            <ul className="space-y-2">
              {byEntity.map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: row.color }} />
                    <span className="truncate text-ink">{row.label}</span>
                    <span className="shrink-0 text-[11.5px] text-ink-muted">{row.count}</span>
                  </span>
                  <span className="tnum flex shrink-0 items-baseline gap-2">
                    <span className="font-medium text-ink">{fmtMillions(row.value, 2)}</span>
                    <span className="text-ink-muted">{fmtPct(row.pct, 1)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-[13px]">
              <span className="font-medium text-ink">Total investments</span>
              <span className="tnum font-semibold text-ink">{fmtMillions(total, 2)}</span>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Business interests" />
            {businessHoldings.length > 0 ? (
              <ul className="space-y-3">
                {businessHoldings.slice(0, 5).map((h) => (
                  <li key={h.id} className="flex items-start justify-between gap-3 text-[13px]">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{h.name}</p>
                      <p className="truncate text-[11.5px] text-ink-muted">
                        {h.owners.length > 0
                          ? h.owners.map((o) => `${o.name} ${o.pct}%`).join(" · ")
                          : h.entityName || h.strategy}
                      </p>
                    </div>
                    <span className="tnum shrink-0 font-medium text-ink">{fmtMillions(h.value, 2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] leading-relaxed text-ink-muted">
                No directly held operating businesses on the schedule.
              </p>
            )}
            {businessOutside > 0 && (
              <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-[13px]">
                <span className="text-ink-muted">Held outside the portfolio</span>
                <span className="tnum font-medium text-ink">{fmtMillions(businessOutside, 2)}</span>
              </div>
            )}
          </Panel>
        </div>
      </section>

      {/* ── Position summary band ─────────────────────────────────────────── */}
      <section className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="Allocation vs policy" />
          {outOfRange.length === 0 ? (
            <>
              <StatusPill tone="positive">All classes within policy ranges</StatusPill>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">
                Positioning is consistent with the strategic asset allocation under
                review with the family.
              </p>
            </>
          ) : (
            <ul className="space-y-2">
              {outOfRange.map((r) => (
                <li key={r.assetClass} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-ink">{r.assetClass}</span>
                  <StatusPill tone={r.status === "Above range" ? "caution" : "critical"} dot={false}>
                    {r.status}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/allocation"
            className="mt-4 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            Review allocation <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        <Panel>
          <PanelHeader title="Liquidity position" />
          <Stat
            label="Liquid assets vs unfunded"
            value={callCoverage != null ? `${callCoverage.toFixed(1)}×` : "—"}
            sub={`${fmtMillions(cashValue)} liquid · ${fmtMillions(unfunded)} unfunded`}
          />
          <div className="mt-4 border-t border-hairline pt-3">
            <MetricRow label="Daily-liquid holdings" value={fmtPct((cashValue / (total || 1)) * 100, 0)} />
            <MetricRow
              label="Multi-year / illiquid"
              value={fmtPct(illiquidPctOf(holdings), 0)}
            />
          </div>
          <Link
            href="/portfolio"
            className="mt-3 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            Unfunded commitment schedule <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        <Panel>
          <PanelHeader title="Risk & concentration" />
          <Stat
            label="Elevated risk factors"
            value={String(elevatedRisks.length)}
            sub={risks.length ? "On the standing risk register" : "Register not yet populated"}
            tone={elevatedRisks.length ? "caution" : undefined}
          />
          <div className="mt-4 border-t border-hairline pt-3">
            <p className="mb-2 text-[12px] text-ink-muted">Largest positions</p>
            <ul className="space-y-1.5">
              {topPositions.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="truncate text-ink">{h.name}</span>
                  <span className="tnum shrink-0 font-medium text-ink">
                    {fmtPct(h.allocationPct, 1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/risk"
            className="mt-3 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            Open risk register <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>
      </section>

      {/* ── Governance ────────────────────────────────────────────── */}
      <section>
        <SectionHeading
          eyebrow="Governance"
          title="Upcoming decisions"
          description="Items routed to the next family review with your advisor."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <Panel>
          {nextMeeting ? (
            <div className="rounded-lg border border-hairline bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-[12px] text-ink-muted">
                <CalendarDays className="h-4 w-4 text-brand" />
                {nextMeeting.date} · {nextMeeting.time}
              </div>
              <p className="mt-1.5 text-[14px] font-medium text-ink">{nextMeeting.title}</p>
              <ul className="mt-2 space-y-1">
                {nextMeeting.agenda.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-[13px] text-ink-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed text-ink-muted">
              No meetings scheduled yet. Your advisor will publish the governance
              calendar here.
            </p>
          )}
          <Link
            href="/meetings"
            className="mt-4 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            View governance calendar <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        {/* Investment Policy (Advisor-Led IPS Workbench) */}
        <Panel>
          <PanelHeader title="Investment policy" />
          <Stat
            label="IPS strategy profile"
            value={ips ? `${ips.completionPercentage}%` : "Not started"}
            sub={STATUS_LABELS[ips?.status ?? "not_started"]}
          />
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${ips?.completionPercentage ?? 0}%` }}
            />
          </div>
          <Link
            href="/ips"
            className="mt-4 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            {ips ? "Open IPS Workbench" : "Start IPS Strategy Session"} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>
        </div>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Values reflect the most recent statements and manager marks available and may
        lag current market values. Lodestone Family Advisors does not provide
        automated investment recommendations. Nothing here is investment advice;
        every item requires advisor and Investment Committee review before any action.
      </p>
    </div>
  );
}
