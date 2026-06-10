import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getActiveClient, getEntities } from "@/lib/data/clients";
import { getPerformance } from "@/lib/data/performance";
import { breakdownBy, totalValue } from "@/lib/portfolio-math";
import { fmtMillions, fmtPct } from "@/lib/calculations";

const isBusinessInterest = (structure: string, strategy: string) =>
  /operating|business/i.test(structure) || /operating business|construction/i.test(strategy);

export default async function NetWorthPage() {
  const [holdings, client, entities, performance] = await Promise.all([
    getHoldingsDetailed(),
    getActiveClient(),
    getEntities(),
    getPerformance(),
  ]);

  const investments = totalValue(holdings);

  // Business ownership held outside the investment portfolio (from the
  // performance summary schedule, when populated).
  const other = performance.filter((p) => p.scope === "other");
  const businessOutside = other.find((o) => /business/i.test(o.label))?.amount ?? 0;

  const netWorth = investments + businessOutside;

  // Operating businesses held inside the portfolio (already counted in investments).
  const businessHoldings = holdings
    .filter((h) => isBusinessInterest(h.structure, h.strategy))
    .sort((a, b) => b.value - a.value);

  const byAssetClass = breakdownBy(holdings, (h) => h.assetClass);
  const byEntity = breakdownBy(holdings, (h) => h.entityName || "Managed Accounts");

  const liquid = holdings
    .filter((h) => h.liquidity === "Daily" || h.liquidity === "Quarterly")
    .reduce((s, h) => s + h.value, 0);
  const illiquid = investments - liquid;

  return (
    <div>
      <PageHeader
        eyebrow="Net Worth"
        title="The full family balance sheet"
        lede="Everything in one view — investment portfolio, business interests, and how the total is held across the family's capital accounts and entities."
        status={{ label: "Discussion Point", tone: "info" }}
        client={{ name: client.name, asOf: client.asOf }}
      />

      {/* Headline band */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Total net worth"
            value={fmtMillions(netWorth)}
            sub="Investments + business interests"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Investment portfolio"
            value={fmtMillions(investments)}
            sub={`${holdings.length} positions`}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Business ownership"
            value={businessOutside > 0 ? fmtMillions(businessOutside) : "—"}
            sub="Held outside the portfolio"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Liquid vs illiquid"
            value={`${fmtPct((liquid / (investments || 1)) * 100, 0)} liquid`}
            sub={`${fmtMillions(liquid)} accessible ≤ quarterly · ${fmtMillions(illiquid)} longer-term`}
          />
        </Panel>
      </div>

      {/* By capital account / entity */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="By capital account"
          title="Where the wealth is held"
          description="The investment portfolio grouped by entity and capital account. Entity values reflect the most recent marks."
        />
        <Panel inset className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {["Capital account", "Positions", "Value", "Share of portfolio"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 font-medium text-ink-muted ${i >= 1 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {byEntity.map((row) => (
                <tr key={row.label} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3.5">
                    <span className="mr-2.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="font-medium text-ink">{row.label}</span>
                  </td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-muted">{row.count}</td>
                  <td className="tnum px-5 py-3.5 text-right font-medium text-ink">{fmtMillions(row.value, 2)}</td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-muted">{fmtPct(row.pct, 1)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-hairline bg-secondary/30">
                <td className="px-5 py-3.5 font-medium text-ink">Total investments</td>
                <td className="tnum px-5 py-3.5 text-right text-ink-muted">{holdings.length}</td>
                <td className="tnum px-5 py-3.5 text-right font-semibold text-ink">{fmtMillions(investments, 2)}</td>
                <td className="tnum px-5 py-3.5 text-right text-ink-muted">100%</td>
              </tr>
            </tfoot>
          </table>
        </Panel>
      </section>

      {/* By asset class */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="By asset class"
          title="Composition of the portfolio"
          description="Share of total investments by asset class."
        />
        <Panel inset className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {["Asset class", "Positions", "Value", "Share"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 font-medium text-ink-muted ${i >= 1 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {byAssetClass.map((row) => (
                <tr key={row.label} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3.5">
                    <span className="mr-2.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="font-medium text-ink">{row.label}</span>
                  </td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-muted">{row.count}</td>
                  <td className="tnum px-5 py-3.5 text-right font-medium text-ink">{fmtMillions(row.value, 2)}</td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-muted">{fmtPct(row.pct, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      {/* Business interests */}
      {businessHoldings.length > 0 && (
        <section className="mb-10">
          <SectionHeading
            eyebrow="Business interests"
            title="Operating businesses"
            description="Directly held operating companies and business interests, included in the portfolio totals above."
          />
          <Panel inset className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-[13px]">
              <thead>
                <tr className="border-b border-hairline">
                  {["Business", "Capital account", "Ownership", "Value"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 font-medium text-ink-muted ${i >= 3 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {businessHoldings.map((h) => (
                  <tr key={h.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{h.name}</p>
                      <p className="text-[11.5px] text-ink-muted">
                        {h.strategy}
                        {h.vintage ? ` · since ${h.vintage}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{h.entityName || "—"}</td>
                    <td className="px-5 py-3.5">
                      {h.owners.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {h.owners.map((o) => (
                            <StatusPill key={o.name} tone="neutral" dot={false}>
                              {o.name} {o.pct}%
                            </StatusPill>
                          ))}
                        </div>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="tnum px-5 py-3.5 text-right font-medium text-ink">
                      {fmtMillions(h.value, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </section>
      )}

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Values reflect the most recent available marks; private assets and
        business interests may lag and are not independently verified. This
        summary is prepared for discussion with your advisor — it is not a
        statement of account and nothing here is investment advice.
      </p>
    </div>
  );
}
