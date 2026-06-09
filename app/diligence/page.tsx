import { Check, Loader, Circle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { cn } from "@/lib/utils";

type WsState = "Complete" | "In progress" | "Open";

interface DiligenceSubject {
  id: string;
  name: string;
  sponsor: string;
  stagePill: { label: string; tone: "caution" | "info" | "neutral" };
  lead: string;
  opened: string;
  workstreams: { name: string; state: WsState }[];
  openQuestions: string[];
  gate: string;
}

const WORKSTREAMS = [
  "Manager & track record",
  "Terms & fees",
  "Operational due diligence",
  "References & background",
  "Legal & structure",
  "Tax review",
];

function ws(states: WsState[]) {
  return WORKSTREAMS.map((name, i) => ({ name, state: states[i] }));
}

// Diligence subjects tie back to the Investment Committee pipeline and to
// holdings under active monitoring. Illustrative.
const SUBJECTS: DiligenceSubject[] = [
  {
    id: "infra",
    name: "Infrastructure Debt Fund III",
    sponsor: "Granite Infrastructure Partners",
    stagePill: { label: "IC Review", tone: "caution" },
    lead: "Sarah Chen, CFA",
    opened: "Mar 2026",
    workstreams: ws([
      "Complete",
      "Complete",
      "Complete",
      "Complete",
      "In progress",
      "Open",
    ]),
    openQuestions: [
      "Confirm UBTI screening for the trust entity.",
      "Does committing fit before resolving the private-markets ceiling?",
    ],
    gate: "Final diligence sign-off required before IC vote.",
  },
  {
    id: "multifamily",
    name: "Direct Multifamily — Sunbelt",
    sponsor: "Cornerstone Real Assets (co-invest)",
    stagePill: { label: "Diligence", tone: "info" },
    lead: "Sarah Chen, CFA",
    opened: "Apr 2026",
    workstreams: ws([
      "Complete",
      "Complete",
      "In progress",
      "Complete",
      "In progress",
      "Open",
    ]),
    openQuestions: [
      "Validate property-level leverage and refinancing assumptions.",
      "Confirm reserve coverage before committing illiquid capital.",
    ],
    gate: "Approved for advisor discussion; tax review outstanding.",
  },
  {
    id: "secondary",
    name: "Secondary PE Portfolio",
    sponsor: "Harbor Lane Secondaries",
    stagePill: { label: "Diligence", tone: "info" },
    lead: "Investment Committee",
    opened: "Apr 2026",
    workstreams: ws([
      "In progress",
      "In progress",
      "Open",
      "Open",
      "Open",
      "Open",
    ]),
    openQuestions: [
      "Validate underlying NAV marks.",
      "Assess overlap with the existing venture position.",
    ],
    gate: "Early diligence — not yet scheduled for IC review.",
  },
  {
    id: "venture",
    name: "Venture Fund II — manager re-diligence",
    sponsor: "Northlight Ventures (existing holding)",
    stagePill: { label: "Monitoring", tone: "neutral" },
    lead: "Sarah Chen, CFA",
    opened: "Feb 2026",
    workstreams: ws([
      "In progress",
      "Complete",
      "Complete",
      "Open",
      "Complete",
      "In progress",
    ]),
    openQuestions: [
      "Re-confirm track record and key-person provisions before the next call.",
    ],
    gate: "Re-diligence required ahead of the next capital call.",
  },
];

const WS_ICON: Record<WsState, React.ReactNode> = {
  Complete: <Check className="h-3.5 w-3.5 text-positive" />,
  "In progress": <Loader className="h-3.5 w-3.5 text-caution" />,
  Open: <Circle className="h-3.5 w-3.5 text-ink-muted/50" />,
};

export default function DiligencePage() {
  const totalOpen = SUBJECTS.reduce((s, d) => s + d.openQuestions.length, 0);
  const inDiligence = SUBJECTS.length;

  return (
    <div>
      <PageHeader
        eyebrow="Manager & Deal Diligence"
        title="Diligence with rigor"
        lede="Disciplined manager and deal diligence is one of the clearest ways an advisor improves outcomes. Each subject runs the same workstreams and clears the same gates before any commitment."
        status={{ label: "Draft for Advisor Review", tone: "caution" }}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat label="In diligence" value={String(inDiligence)} sub="Active subjects" />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Open questions"
            value={String(totalOpen)}
            sub="Across all subjects"
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat label="Workstreams" value="6" sub="Per subject, standardized" />
        </Panel>
        <Panel className="p-5">
          <Stat label="Decision gates" value="100%" sub="Require sign-off" />
        </Panel>
      </div>

      <SectionHeading
        eyebrow="Tracker"
        title="Diligence subjects"
        description="Standardized workstreams with explicit decision gates. Diligence ties directly to the committee pipeline."
      />
      <div className="space-y-4">
        {SUBJECTS.map((d) => {
          const done = d.workstreams.filter((w) => w.state === "Complete").length;
          const pct = Math.round((done / d.workstreams.length) * 100);
          return (
            <Panel key={d.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-serif text-[16px] font-medium text-ink">
                      {d.name}
                    </h3>
                    <StatusPill tone={d.stagePill.tone} dot={false}>
                      {d.stagePill.label}
                    </StatusPill>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-ink-muted">
                    {d.sponsor} · Lead {d.lead} · Opened {d.opened}
                  </p>
                </div>
                <div className="w-40">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-ink-muted">
                    <span>Workstreams</span>
                    <span className="tnum">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-2 py-4 sm:grid-cols-2">
                {d.workstreams.map((w) => (
                  <div
                    key={w.name}
                    className="flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span className="flex items-center gap-2 text-ink">
                      {WS_ICON[w.state]}
                      {w.name}
                    </span>
                    <span
                      className={cn(
                        "text-[12px]",
                        w.state === "Complete" && "text-positive",
                        w.state === "In progress" && "text-caution",
                        w.state === "Open" && "text-ink-muted",
                      )}
                    >
                      {w.state}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-hairline pt-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="lg:max-w-md">
                  <p className="eyebrow mb-2">Open questions</p>
                  <ul className="space-y-1">
                    {d.openQuestions.map((q) => (
                      <li key={q} className="text-[12.5px] text-ink-muted">
                        • {q}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:max-w-xs lg:text-right">
                  <p className="eyebrow mb-1">Decision gate</p>
                  <p className="text-[12.5px] font-medium text-ink">{d.gate}</p>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Diligence records and statuses are illustrative. Nothing here is investment
        advice. No commitment proceeds until diligence gates are cleared and the
        advisor and Investment Committee have signed off.
      </p>
    </div>
  );
}
