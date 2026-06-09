import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill, toneForLabel } from "@/components/status-pill";
import { cn } from "@/lib/utils";
import { type RiskSeverity } from "@/lib/mock-data";
import { fmtPct } from "@/lib/calculations";
import { getRiskRegister, canWriteRisk, type RiskView } from "@/lib/data/risk";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getActiveClient } from "@/lib/data/clients";
import { breakdownBy, illiquidPctOf, marketMixOf } from "@/lib/portfolio-math";
import { NewRiskForm } from "./new-risk-form";

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

function RiskRow({ r }: { r: RiskView }) {
  const severityTone = SEVERITY_TONE[r.severity as RiskSeverity] ?? "caution";
  const severityBar = SEVERITY_BAR[r.severity as RiskSeverity] ?? "bg-caution";
  return (
    <Panel className="p-5 pl-6 relative overflow-hidden">
      <span
        className={cn(
          "absolute inset-y-4 left-0 w-[3px] rounded-full",
          severityBar,
        )}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="lg:max-w-xl">
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <h3 className="font-serif text-[16px] font-medium text-ink">
              {r.factor}
            </h3>
            <StatusPill tone={severityTone} dot={false}>
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

export default async function RiskPage() {
  const [register, canWrite, holdings, client] = await Promise.all([
    getRiskRegister(),
    canWriteRisk(),
    getHoldingsDetailed(),
    getActiveClient(),
  ]);
  const mix = marketMixOf(holdings);
  const byClass = breakdownBy(holdings, (h) => h.assetClass);
  const topClass = byClass[0] ?? null;
  const elevated = register.filter((r) => r.severity === "Elevated");
  const reviewQueue = register.filter((r) => REVIEW_STATUSES.has(r.status));

  return (
    <div>
      <PageHeader
        eyebrow="Risk Register"
        title="Is risk being taken intentionally?"
        lede="A standing register of the risks specific to a family office — concentration, illiquidity, managers, leverage, operating businesses, tax, governance, and behavior. The aim is deliberate risk, reviewed on a cadence, not a single score."
        status={{ label: "Discussion Point", tone: "info" }}
        client={{ name: client.name, asOf: client.asOf }}
      />

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Elevated factors"
            value={String(elevated.length)}
            sub={register.length ? `Of ${register.length} on the register` : "Register not yet populated"}
            tone={elevated.length ? "critical" : undefined}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Illiquid allocation"
            value={fmtPct(illiquidPctOf(holdings), 0)}
            sub="Multi-year and illiquid"
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Private markets"
            value={fmtPct(mix.privatePct, 0)}
            sub="Of total investments"
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Largest asset class"
            value={topClass ? fmtPct(topClass.pct, 0) : "—"}
            sub={topClass?.label ?? ""}
            tone="caution"
          />
        </Panel>
      </div>

      {canWrite ? <NewRiskForm /> : null}

      {/* Risk review queue */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Priority"
          title="Risk review queue"
          description="The factors actively requiring advisor or committee attention this quarter."
        />
        <div className="space-y-3">
          {reviewQueue.length === 0 && (
            <Panel className="p-5">
              <p className="text-[13px] leading-relaxed text-ink-muted">
                The standing risk register is being prepared with your advisor.
                Concentration, illiquidity, manager, and governance factors will be
                tracked here and reviewed each quarter.
              </p>
            </Panel>
          )}
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
          {register.map((r) => (
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
