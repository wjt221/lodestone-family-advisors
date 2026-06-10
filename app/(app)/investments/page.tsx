import { redirect } from "next/navigation";
import { Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { StatusPill, type Tone } from "@/components/status-pill";
import {
  PIPELINE,
  PIPELINE_STAGES,
  type PipelineItem,
  type PipelineStage,
} from "@/lib/mock-data";
import { fmtMillions } from "@/lib/calculations";
import { getSessionContext, isDemoMode } from "@/lib/data/session";
import { getActiveClient } from "@/lib/data/clients";
import { EmptyState } from "@/components/empty-state";

const STAGE_TONE: Record<PipelineStage, Tone> = {
  Sourced: "neutral",
  "Initial Screen": "neutral",
  Diligence: "info",
  "IC Review": "caution",
  "Approved for Advisor Discussion": "caution",
  Declined: "neutral",
  Invested: "positive",
  Monitoring: "positive",
};

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="text-[12.5px] leading-relaxed text-ink">{value}</p>
    </div>
  );
}

function PipelineCard({ p }: { p: PipelineItem }) {
  const declined = p.stage === "Declined";
  return (
    <Panel className={declined ? "p-5 opacity-70" : "p-5"}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <h3 className="font-serif text-[17px] font-medium text-ink">{p.name}</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">
            {p.sponsor} · {p.assetClass}
          </p>
        </div>
        <div className="text-right">
          <StatusPill tone={STAGE_TONE[p.stage]} dot={false}>
            {p.stage}
          </StatusPill>
          {p.targetCommitment > 0 && (
            <p className="tnum mt-1.5 text-[12px] text-ink-muted">
              {fmtMillions(p.targetCommitment)} target
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 py-4 sm:grid-cols-2">
        <div>
          <p className="eyebrow mb-2">Merits</p>
          <ul className="space-y-1.5">
            {p.merits.map((m) => (
              <li key={m} className="flex items-start gap-2 text-[12.5px] text-ink">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-2">Risks to review</p>
          <ul className="space-y-1.5">
            {p.risks.map((r) => (
              <li key={r} className="flex items-start gap-2 text-[12.5px] text-ink">
                <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-caution" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-hairline py-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCell label="Fees" value={p.fees} />
        <MetaCell label="Liquidity terms" value={p.liquidityTerms} />
        <MetaCell label="Alignment" value={p.alignment} />
        <MetaCell label="Tax considerations" value={p.taxConsiderations} />
      </div>

      <div className="flex flex-col gap-3 border-t border-hairline pt-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="lg:max-w-md">
          {p.openQuestions.length > 0 ? (
            <>
              <p className="eyebrow mb-2">Open diligence questions</p>
              <ul className="space-y-1">
                {p.openQuestions.map((q) => (
                  <li key={q} className="text-[12.5px] text-ink-muted">
                    • {q}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[12.5px] text-ink-muted">No open diligence questions.</p>
          )}
        </div>
        <div className="lg:text-right">
          <p className="eyebrow mb-1">IC decision status</p>
          <p className="text-[12.5px] font-medium text-ink">{p.decisionStatus}</p>
        </div>
      </div>
    </Panel>
  );
}

export default async function InvestmentsPage() {
  // Pipeline is internal-only — redirect family members to dashboard.
  const ctx = await getSessionContext();
  if (ctx.configured && ctx.role === "client") redirect("/dashboard");

  // The IC pipeline is not yet populated for live clients; never show demo deals.
  if (!isDemoMode()) {
    const client = await getActiveClient();
    return (
      <div>
        <PageHeader
          eyebrow="Investment Pipeline"
          title="Decisions in front of the committee"
          lede="A disciplined pipeline for evaluating new opportunities — merits, risks, fees, liquidity terms, and tax considerations, documented before any commitment."
          status={{ label: "In Preparation", tone: "info" }}
          client={{ name: client.name, asOf: client.asOf }}
        />
        <EmptyState
          title="No opportunities in the pipeline yet"
          description="When Lodestone brings an opportunity to the family, it will appear here with its merits, risks, fees, and terms documented for Investment Committee review."
        />
      </div>
    );
  }

  const counts = new Map<PipelineStage, number>();
  for (const p of PIPELINE) counts.set(p.stage, (counts.get(p.stage) ?? 0) + 1);

  const active = PIPELINE.filter((p) => p.stage !== "Declined");
  const declined = PIPELINE.filter((p) => p.stage === "Declined");

  return (
    <div>
      <PageHeader
        eyebrow="Investment Committee"
        title="Capital allocation pipeline"
        lede="Every opportunity moves through the same disciplined process — sourced, screened, diligenced, and decided by the Investment Committee. Pipeline items are evaluated, never auto-recommended."
        status={{ label: "Decision for Investment Committee", tone: "caution" }}
      />

      {/* Stage rail */}
      <Panel inset className="mb-8 overflow-x-auto">
        <div className="flex min-w-[720px] divide-x divide-hairline">
          {PIPELINE_STAGES.map((stage) => {
            const n = counts.get(stage) ?? 0;
            return (
              <div key={stage} className="flex-1 px-4 py-4">
                <p className="tnum font-serif text-[22px] font-medium leading-none text-ink">
                  {n}
                </p>
                <p className="mt-1.5 text-[11px] leading-tight text-ink-muted">
                  {stage}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      <section className="mb-10">
        <SectionHeading
          eyebrow="Active"
          title="Opportunities under evaluation"
          description="In the funnel from sourcing through committee review."
        />
        <div className="space-y-4">
          {active.map((p) => (
            <PipelineCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Documented"
          title="Declined — kept for the record"
          description="Declined opportunities are documented so the reasoning is preserved."
        />
        <div className="space-y-4">
          {declined.map((p) => (
            <PipelineCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Pipeline items, terms, and target commitments are illustrative. Nothing here
        is investment advice or a recommendation. Commitments require advisor and
        Investment Committee approval.
      </p>
    </div>
  );
}
