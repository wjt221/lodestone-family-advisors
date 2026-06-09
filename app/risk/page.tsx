import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill, toneForLabel } from "@/components/status-pill";
import { cn } from "@/lib/utils";
import {
  RISK_REGISTER,
  type RiskSeverity,
  type RiskItem,
} from "@/lib/mock-data";
import {
  illiquidPct,
  marketMix,
  allocationByClass,
  fmtPct,
} from "@/lib/calculations";

const SEVERITY_TONE: Record<RiskSeverity, "critical" | "caution" | "info"> = {
  Elevated: "critical",
  Moderate: "caution",
  Low: "info",
};

const SEVERITY_BAR: Record<RiskSeverity, string> = {
  Elevated: "bg-critical",
  Moderate: "bg-caution",
  Low: "bg-info",
};

const REVIEW_STATUSES = new Set([
  "Advisor Review Required",
  "Risk to Review",
  "Diligence in Progress",
]);

function RiskRow({ r }: { r: RiskItem }) {
  return (
    <Panel className="p-5 pl-6 relative overflow-hidden">
      <span
        className={cn(
          "absolute inset-y-4 left-0 w-[3px] rounded-full",
          SEVERITY_BAR[r.severity],
        )}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="lg:max-w-xl">
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <h3 className="font-serif text-[16px] font-medium text-ink">
              {r.factor}
            </h3>
            <StatusPill tone={SEVERITY_TONE[r.severity]} dot={false}>
              {r.severity}
            </StatusPill>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            {r.observation}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 lg:w-64 lg:items-end">
          <StatusPill tone={toneForLabel(r.status)}>{r.status}</StatusPill>
          <p className="text-[12px] text-ink-muted lg:text-right">{r.exposure}</p>
          <p className="text-[11px] text-ink-muted/70 lg:text-right">
            Owner · {r.owner}
          </p>
        </div>
      </div>
    </Panel>
  );
}

export default function RiskPage() {
  const mix = marketMix();
  const operating =
    allocationByClass().find((c) => c.assetClass === "Direct / Operating")?.pct ?? 0;
  const elevated = RISK_REGISTER.filter((r) => r.severity === "Elevated");
  const reviewQueue = RISK_REGISTER.filter((r) => REVIEW_STATUSES.has(r.status));

  return (
    <div>
      <PageHeader
        eyebrow="Risk Register"
        title="Is risk being taken intentionally?"
        lede="A standing register of the risks specific to a family office — concentration, illiquidity, managers, leverage, operating businesses, tax, governance, and behavior. The aim is deliberate risk, reviewed on a cadence, not a single score."
        status={{ label: "Discussion Point", tone: "info" }}
      />

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Elevated factors"
            value={String(elevated.length)}
            sub="Of 8 on the register"
            tone="critical"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Illiquid allocation"
            value={fmtPct(illiquidPct(), 0)}
            sub="Multi-year and illiquid"
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Private markets"
            value={fmtPct(mix.privatePct, 0)}
            sub={`Ceiling ${mix.ceiling}%`}
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Operating businesses"
            value={fmtPct(operating, 0)}
            sub="Ceiling 15%"
            tone="caution"
          />
        </Panel>
      </div>

      {/* Risk review queue */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Priority"
          title="Risk review queue"
          description="The factors actively requiring advisor or committee attention this quarter."
        />
        <div className="space-y-3">
          {reviewQueue.map((r) => (
            <RiskRow key={r.id} r={r} />
          ))}
        </div>
      </section>

      {/* Full register */}
      <section>
        <SectionHeading
          eyebrow="Standing register"
          title="All risk factors"
          description="Reviewed each quarter at the Investment Committee."
        />
        <div className="space-y-3">
          {RISK_REGISTER.map((r) => (
            <RiskRow key={r.id} r={r} />
          ))}
        </div>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        The risk register is an illustrative discussion tool. Severities and
        observations are not investment advice or predictions. Each item requires
        advisor and Investment Committee review.
      </p>
    </div>
  );
}
