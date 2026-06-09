import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel, PanelHeader } from "@/components/panel";
import { Stat, MetricRow } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { ReviewFlag } from "@/components/review-flag";
import { AllocationChart } from "@/components/allocation-chart";
import { NetWorthChart } from "@/components/networth-chart";
import {
  ATTENTION_ITEMS,
  DISCOVERY,
  MEETINGS,
  PERFORMANCE,
  RISK_REGISTER,
  PIPELINE,
} from "@/lib/mock-data";
import {
  allocationByClass,
  marketMix,
  liquidityReserve,
  liquidityCoverage,
  concentrationWatchlist,
  fmtMillions,
  fmtPct,
  fmtSignedPct,
} from "@/lib/calculations";

export default function DashboardPage() {
  const classes = allocationByClass();
  const mix = marketMix();
  const reserve = liquidityReserve();
  const coverage12 = liquidityCoverage()[0];
  const concentration = concentrationWatchlist();

  const elevatedRisks = RISK_REGISTER.filter((r) => r.severity === "Elevated");
  const awaitingIC = PIPELINE.filter(
    (p) => p.stage === "IC Review" || p.stage === "Approved for Advisor Discussion",
  );
  const nextMeeting = MEETINGS.find((m) => m.status === "Scheduled");
  const discoveryComplete = DISCOVERY.filter((d) => d.state === "Complete").length;

  return (
    <div>
      <PageHeader
        eyebrow="Command Center"
        title="What needs attention this quarter"
        lede="A working view of the Atwater Family Office — objectives, liquidity, risk, and the decisions in front of the Investment Committee. Every figure is illustrative and prepared for advisor review."
        status={{ label: "Advisor Review Required", tone: "critical" }}
      />

      {/* ── Portfolio at a glance ─────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Total AUM"
            value={fmtMillions(47_300_000)}
            sub="Across 3 entities"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="YTD return · net"
            value={fmtSignedPct(PERFORMANCE.ytd)}
            sub={`Reference ${fmtSignedPct(PERFORMANCE.benchmarkYtd)}`}
            tone="positive"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Private markets"
            value={fmtPct(mix.privatePct, 0)}
            sub={`Framework ceiling ${mix.ceiling}%`}
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Liquidity reserve"
            value={fmtPct(reserve.pct)}
            sub={`Policy ${reserve.min}–${reserve.max}%`}
            tone="critical"
          />
        </Panel>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Asset allocation"
            description="By asset class, share of total AUM."
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
            <AllocationChart height={240} />
            <ul className="space-y-1.5">
              {classes.map((c) => (
                <li
                  key={c.assetClass}
                  className="flex items-center justify-between gap-3 py-1"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                      style={{ background: c.color }}
                    />
                    <span className="truncate text-[13px] text-ink">
                      {c.assetClass}
                    </span>
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
            title="Net worth trajectory"
            description="Illustrative, year-end values."
          />
          <NetWorthChart height={172} />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-hairline pt-4">
            <div>
              <p className="text-[11px] text-ink-muted">1-year</p>
              <p className="tnum text-[15px] font-medium text-positive">
                {fmtSignedPct(PERFORMANCE.oneYear)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ink-muted">3-yr ann.</p>
              <p className="tnum text-[15px] font-medium text-ink">
                {fmtSignedPct(PERFORMANCE.threeYearAnnualized)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ink-muted">Inception</p>
              <p className="tnum text-[15px] font-medium text-ink">
                {fmtSignedPct(PERFORMANCE.inceptionCumulative)}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* ── What needs attention ──────────────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Review queue"
          title="What needs attention"
          description="Flags for advisor and committee review. These are observations and decisions to evaluate — not recommendations to trade."
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {ATTENTION_ITEMS.slice(0, 6).map((item) => (
            <ReviewFlag key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ── Position summary band ─────────────────────────────────────────── */}
      <section className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="Strategic alignment" />
          <p className="text-[13px] leading-relaxed text-ink-muted">
            {discoveryComplete} of {DISCOVERY.length} discovery areas confirmed.
            Liquidity policy and risk calibration remain in review.
          </p>
          <div className="mt-4 space-y-1.5">
            {DISCOVERY.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 text-[13px]"
              >
                <span className="text-ink">{d.title}</span>
                <StatusPill dot={false}>{d.state}</StatusPill>
              </div>
            ))}
          </div>
          <Link
            href="/strategy"
            className="mt-5 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            Open strategy process <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        <Panel>
          <PanelHeader title="Liquidity position" />
          <Stat
            label="12-month coverage"
            value={`${coverage12.coverageRatio.toFixed(1)}×`}
            sub={`${fmtMillions(coverage12.need)} of obligations`}
          />
          <div className="mt-4 border-t border-hairline pt-3">
            <MetricRow
              label="Dedicated reserve"
              value={`${fmtPct(reserve.pct)}`}
              hint={`Policy floor ${reserve.min}%`}
            />
            <MetricRow
              label="Reserve status"
              value={<StatusPill>{reserve.status}</StatusPill>}
            />
          </div>
          <Link
            href="/liquidity"
            className="mt-3 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            Evaluate liquidity coverage <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        <Panel>
          <PanelHeader title="Risk & concentration" />
          <Stat
            label="Elevated risk factors"
            value={String(elevatedRisks.length)}
            sub="On the standing risk register"
            tone="caution"
          />
          <div className="mt-4 border-t border-hairline pt-3">
            <p className="mb-2 text-[12px] text-ink-muted">Concentration watchlist</p>
            <ul className="space-y-1.5">
              {concentration.slice(0, 3).map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between gap-3 text-[13px]"
                >
                  <span className="truncate text-ink">{c.name}</span>
                  <span className="tnum shrink-0 font-medium text-ink">
                    {fmtPct(c.pct, 0)}
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

      {/* ── Upcoming decisions ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Upcoming decisions"
            description="Items routed to the next Investment Committee."
          />
          {nextMeeting && (
            <div className="mb-4 rounded-lg border border-hairline bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-[12px] text-ink-muted">
                <CalendarDays className="h-4 w-4 text-brand" />
                {nextMeeting.date} · {nextMeeting.time}
              </div>
              <p className="mt-1.5 text-[14px] font-medium text-ink">
                {nextMeeting.title}
              </p>
              <ul className="mt-2 space-y-1">
                {nextMeeting.agenda.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-2 text-[13px] text-ink-muted"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            href="/meetings"
            className="flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            View governance calendar <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        <Panel>
          <PanelHeader
            title="Pipeline awaiting decision"
            description="In or near Investment Committee review."
          />
          <ul className="divide-y divide-hairline">
            {awaitingIC.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-ink">
                    {p.name}
                  </p>
                  <p className="text-[12px] text-ink-muted">
                    {p.sponsor} · {fmtMillions(p.targetCommitment)} target
                  </p>
                </div>
                <StatusPill
                  tone={p.stage === "IC Review" ? "caution" : "info"}
                  dot={false}
                >
                  {p.stage}
                </StatusPill>
              </li>
            ))}
          </ul>
          <Link
            href="/investments"
            className="mt-4 flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-brand"
          >
            Open the pipeline <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Panel>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        All values, returns, and review flags shown are illustrative mock data for
        demonstration only. Lodestone Family Advisors does not provide automated
        investment recommendations. Nothing here is investment advice; every item
        requires advisor and Investment Committee review before any action.
      </p>
    </div>
  );
}
