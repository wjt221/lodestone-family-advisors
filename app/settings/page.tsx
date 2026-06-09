import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel, PanelHeader } from "@/components/panel";
import { MetricRow } from "@/components/stat";
import { CLIENT, ENTITIES } from "@/lib/mock-data";
import { fmtMillions, allocationByEntity, fmtPct } from "@/lib/calculations";

export default function SettingsPage() {
  const entityAlloc = allocationByEntity();

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Relationship & settings"
        lede="The structure of the relationship between the Atwater Family Office and Lodestone Family Advisors."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Relationship" />
          <div className="divide-y divide-hairline">
            <MetricRow label="Client" value={CLIENT.name} />
            <MetricRow label="Lead advisor" value={CLIENT.advisor} />
            <MetricRow label="Advisory firm" value="Lodestone Family Advisors" />
            <MetricRow label="Relationship since" value={CLIENT.relationshipSince} />
            <MetricRow label="Assets under oversight" value={fmtMillions(CLIENT.aum)} />
            <MetricRow label="Reporting currency" value={CLIENT.reportingCurrency} />
            <MetricRow label="Reporting as of" value={CLIENT.asOf} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Advisory team"
            description="Your points of contact at Lodestone."
          />
          <div className="space-y-4">
            {[
              { initials: "SC", name: CLIENT.advisor, role: "Lead Advisor" },
              {
                initials: "IC",
                name: "Investment Committee",
                role: "Approval authority for commitments & policy",
              },
              {
                initials: "CP",
                name: "Family CPA (coordinated)",
                role: "Tax-aware planning partner",
              },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/12 text-[13px] font-medium text-brand">
                  {p.initials}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-ink">{p.name}</p>
                  <p className="text-[12px] text-ink-muted">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <SectionHeading eyebrow="Structure" title="Legal entities" />
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {ENTITIES.map((e) => {
          const pct = entityAlloc.find((a) => a.id === e.id)?.pct ?? 0;
          return (
            <Panel key={e.id} className="p-5">
              <p className="eyebrow">{e.type}</p>
              <h3 className="mt-2 font-serif text-[17px] font-medium text-ink">
                {e.name}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                {e.purpose}
              </p>
              <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-3">
                <span className="tnum text-[15px] font-medium text-ink">
                  {fmtMillions(e.value)}
                </span>
                <span className="tnum text-[12px] text-ink-muted">
                  {fmtPct(pct, 0)} of AUM
                </span>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="bg-secondary/30">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="space-y-2 text-[13px] leading-relaxed text-ink-muted">
            <p className="text-[14px] font-medium text-ink">
              Compliance & disclosures
            </p>
            <p>
              LFA Investment OS is an advisor-led strategy, governance, and oversight
              portal. It is not a robo-advisor and does not generate automated
              investment recommendations or execute trades.
            </p>
            <p>
              All content is illustrative, for discussion only, and requires review
              and approval by your advisor and the Investment Committee before any
              action is taken. Nothing in this portal is investment, tax, or legal
              advice.
            </p>
            <p className="text-[11px] text-ink-muted/70">
              Lodestone Family Advisors · Investment OS · Demo build with illustrative
              data.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
