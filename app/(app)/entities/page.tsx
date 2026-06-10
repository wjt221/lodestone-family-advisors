import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";

import { StatusPill } from "@/components/status-pill";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getActiveClient, getEntities } from "@/lib/data/clients";
import { getEntityOwners } from "@/lib/data/owners";
import { ownerLookThrough, totalValue, breakdownBy } from "@/lib/portfolio-math";
import { fmtMillions, fmtPct } from "@/lib/calculations";

export default async function EntitiesPage() {
  const [holdings, client, entities, entityOwners] = await Promise.all([
    getHoldingsDetailed(),
    getActiveClient(),
    getEntities(),
    getEntityOwners(),
  ]);

  const total = totalValue(holdings) || 1;
  const owners = ownerLookThrough(holdings);
  const byEntity = breakdownBy(holdings, (h) => h.entityName || "Managed Accounts");
  const ownersByEntity = new Map<string, typeof entityOwners>();
  for (const o of entityOwners) {
    const list = ownersByEntity.get(o.entityName) ?? [];
    list.push(o);
    ownersByEntity.set(o.entityName, list);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Ownership"
        title="Who owns what"
        lede="The same capital attributed to each family member on a look-through basis — entity ownership percentages applied to every underlying position, so each person can see their true exposure."
        status={{ label: "Discussion Point", tone: "info" }}
        client={{ name: client.name, asOf: client.asOf }}
      />

      {/* Owner look-through */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Look-through"
          title="Exposure by owner"
          description="Entity holdings are attributed at ownership percentages — e.g. Scorpio positions count 70% to Kim and 30% to Cindy. Joint accounts are shown as joint until splits are documented."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {owners.map((o) => (
            <Panel key={o.owner} className="p-5">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: o.color }}
                />
                <p className="truncate text-[14px] font-medium text-ink">{o.owner}</p>
              </div>
              <p className="tnum font-serif text-[24px] font-medium text-ink">
                {fmtMillions(o.value)}
              </p>
              <p className="text-[12px] text-ink-muted">
                {fmtPct(o.pct)} of investments · {o.positions} positions
              </p>
              <div className="mt-4 space-y-2 border-t border-hairline pt-3">
                {o.byClass.slice(0, 3).map((c) => (
                  <div key={c.label}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12px] text-ink-muted">{c.label}</span>
                      <span className="tnum shrink-0 text-[11.5px] text-ink-muted">
                        {fmtMillions(c.value, 1)}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, background: c.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      {/* Entity structure */}
      <section>
        <SectionHeading
          eyebrow="Structure"
          title="Entities & ownership"
          description="Each entity with its owners and ownership percentages. Items marked for confirmation are working assumptions to review with your advisor."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {entities.map((e) => {
            const eOwners = ownersByEntity.get(e.name) ?? [];
            const value = byEntity.find((b) => b.label === e.name)?.value ?? e.value;
            const positions = holdings.filter((h) => h.entityName === e.name).length;
            return (
              <Panel key={e.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">{e.type || "Entity"}</p>
                    <h3 className="mt-1 font-serif text-[17px] font-medium text-ink">
                      {e.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="tnum text-[16px] font-medium text-ink">
                      {fmtMillions(value)}
                    </p>
                    <p className="text-[11.5px] text-ink-muted">
                      {fmtPct((value / total) * 100, 0)} · {positions} positions
                    </p>
                  </div>
                </div>
                {eOwners.length > 0 && (
                  <div className="mt-4 border-t border-hairline pt-3">
                    <p className="eyebrow mb-2">Ownership</p>
                    <ul className="space-y-2">
                      {eOwners.map((o) => (
                        <li key={o.ownerName} className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink">
                            {o.ownerName}
                            {/confirm|assum/i.test(o.note) && (
                              <StatusPill tone="caution" dot={false}>
                                To confirm
                              </StatusPill>
                            )}
                          </span>
                          <span className="tnum shrink-0 text-[13px] font-medium text-ink">
                            {o.pct}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Ownership attribution is derived from account titling and stated entity
        ownership percentages, and is a planning view — not a legal determination of
        title. Splits marked for confirmation should be reviewed with your advisor
        and counsel.
      </p>
    </div>
  );
}
