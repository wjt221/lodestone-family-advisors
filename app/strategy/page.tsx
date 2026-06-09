import Link from "next/link";
import { ArrowUpRight, HelpCircle, CircleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { StatusPill, toneForLabel } from "@/components/status-pill";
import { DISCOVERY, type DiscoveryState } from "@/lib/mock-data";

const STATE_WEIGHT: Record<DiscoveryState, number> = {
  Complete: 100,
  "In Review": 60,
  Draft: 30,
  "Not Started": 0,
};

// Time-horizon mapping — capital segmented by when it is expected to be needed.
const HORIZONS = [
  {
    band: "Reserve",
    window: "0–2 years",
    purpose: "Capital calls, taxes, distributions, debt service",
    classes: "Cash & Reserves, short fixed income",
  },
  {
    band: "Stability",
    window: "2–7 years",
    purpose: "Income and capital preservation",
    classes: "Fixed income, private credit",
  },
  {
    band: "Growth",
    window: "7–15 years",
    purpose: "Real, after-tax growth of family capital",
    classes: "Public equity, real assets",
  },
  {
    band: "Legacy",
    window: "15+ years",
    purpose: "Multi-generational and illiquid compounding",
    classes: "Private equity, venture, direct / operating",
  },
];

export default function StrategyPage() {
  const completion = Math.round(
    DISCOVERY.reduce((s, d) => s + STATE_WEIGHT[d.state], 0) / DISCOVERY.length,
  );
  const openQuestions = DISCOVERY.flatMap((d) => d.openQuestions).length;
  const missingInputs = DISCOVERY.flatMap((d) => d.missingInputs).length;

  return (
    <div>
      <PageHeader
        eyebrow="Discovery & Governance"
        title="The family's investment process"
        lede="Lodestone guides the Atwater family through a structured discovery — clarifying objectives, mapping horizons, setting liquidity and risk policy, and formalizing how decisions get made. Progress below is a proposed framework for review."
        status={{ label: "Proposed Framework", tone: "info" }}
        actions={
          <Link
            href="/strategy/wizard"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Open discovery workspace <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* Completion summary */}
      <Panel className="mb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-8">
            <div>
              <p className="eyebrow">Process completion</p>
              <p className="tnum mt-2 font-serif text-[34px] font-medium leading-none text-ink">
                {completion}%
              </p>
            </div>
            <div className="hidden h-10 w-px bg-hairline sm:block" />
            <div className="flex gap-8">
              <div>
                <p className="eyebrow">Open questions</p>
                <p className="tnum mt-2 font-serif text-[22px] font-medium leading-none text-caution">
                  {openQuestions}
                </p>
              </div>
              <div>
                <p className="eyebrow">Missing inputs</p>
                <p className="tnum mt-2 font-serif text-[22px] font-medium leading-none text-critical">
                  {missingInputs}
                </p>
              </div>
            </div>
          </div>
          <div className="sm:w-72">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Objectives and horizon mapping are confirmed. Liquidity policy and
              risk calibration remain in review before the IPS is adopted.
            </p>
          </div>
        </div>
      </Panel>

      {/* Discovery areas */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Discovery"
          title="Where the family stands"
          description="Each area below carries its open questions and the inputs still needed from the family."
        />
        <div className="space-y-3">
          {DISCOVERY.map((d) => (
            <Panel key={d.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="lg:max-w-md">
                  <div className="mb-1.5 flex items-center gap-3">
                    <h3 className="font-serif text-[16px] font-medium text-ink">
                      {d.title}
                    </h3>
                    <StatusPill tone={toneForLabel(d.state)} dot={false}>
                      {d.state}
                    </StatusPill>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-muted">
                    {d.summary}
                  </p>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-md">
                  <div>
                    <p className="eyebrow mb-2 flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-caution" />
                      Open questions
                    </p>
                    {d.openQuestions.length ? (
                      <ul className="space-y-1.5">
                        {d.openQuestions.map((q) => (
                          <li key={q} className="text-[12.5px] leading-snug text-ink">
                            {q}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[12.5px] text-ink-muted">None outstanding.</p>
                    )}
                  </div>
                  <div>
                    <p className="eyebrow mb-2 flex items-center gap-1.5">
                      <CircleAlert className="h-3.5 w-3.5 text-critical" />
                      Missing inputs
                    </p>
                    {d.missingInputs.length ? (
                      <ul className="space-y-1.5">
                        {d.missingInputs.map((m) => (
                          <li key={m} className="text-[12.5px] leading-snug text-ink">
                            {m}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[12.5px] text-ink-muted">All received.</p>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      {/* Time-horizon mapping */}
      <section>
        <SectionHeading
          eyebrow="Framework"
          title="Time-horizon mapping"
          description="Capital is matched to the horizon over which it is expected to be needed — the foundation for both liquidity and allocation policy."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {HORIZONS.map((h, i) => (
            <Panel key={h.band} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">{`0${i + 1}`}</span>
                <span className="text-[12px] font-medium text-brand">{h.window}</span>
              </div>
              <h3 className="font-serif text-[18px] font-medium text-ink">{h.band}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                {h.purpose}
              </p>
              <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-ink">
                {h.classes}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        This discovery summary is a proposed framework for discussion with Lodestone
        Family Advisors. It is not investment advice and does not constitute a
        commitment to any strategy or allocation.
      </p>
    </div>
  );
}
