import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel, PanelHeader } from "@/components/panel";
import { MetricRow } from "@/components/stat";
import { getActiveClient, getEntities } from "@/lib/data/clients";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { totalValue } from "@/lib/portfolio-math";
import { fmtMillions, fmtPct } from "@/lib/calculations";

export default async function SettingsPage() {
  const [client, entities, holdings] = await Promise.all([
    getActiveClient(),
    getEntities(),
    getHoldingsDetailed(),
  ]);
  const total = totalValue(holdings) || 1;
  const entityValue = (name: string) =>
    holdings.filter((h) => h.entityName === name).reduce((s, h) => s + h.value, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Relationship & settings"
        lede={`The structure of the relationship between ${client.name} and Lodestone Family Advisors.`}
        client={{ name: client.name, asOf: client.asOf }}
      />

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Relationship" />
          <div className="divide-y divide-hairline">
            <MetricRow label="Client" value={client.name} />
            <MetricRow label="Advisory firm" value="Lodestone Family Advisors" />
            <MetricRow label="Relationship since" value={client.relationshipSince || "—"} />
            <MetricRow label="Assets under oversight" value={fmtMillions(totalValue(holdings))} />
            <MetricRow label="Reporting currency" value={client.reportingCurrency} />
            <MetricRow label="Reporting as of" value={client.asOf || "—"} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Advisory team"
            description="Your points of contact at Lodestone."
          />
          <div className="space-y-4">
            {[
              { initials: "LF", name: "Lodestone Family Advisors", role: "Lead Advisor" },
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

      <SectionHeading eyebrow="Structure" title="Entities & households" />
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {entities.map((e) => {
          const value = entityValue(e.name) || e.value;
          return (
            <Panel key={e.id} className="p-5">
              <p className="eyebrow">{e.type || "Entity"}</p>
              <h3 className="mt-2 font-serif text-[17px] font-medium text-ink">
                {e.name}
              </h3>
              {e.purpose ? (
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  {e.purpose}
                </p>
              ) : null}
              <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-3">
                <span className="tnum text-[15px] font-medium text-ink">
                  {fmtMillions(value)}
                </span>
                <span className="tnum text-[12px] text-ink-muted">
                  {fmtPct((value / total) * 100, 0)} of investments
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
              All content is for discussion only and requires review and approval by
              your advisor and the Investment Committee before any action is taken.
              Nothing in this portal is investment, tax, or legal advice.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
