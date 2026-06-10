import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getActiveClient } from "@/lib/data/clients";
import { breakdownBy, totalValue, totalUnfundedOf } from "@/lib/portfolio-math";
import { fmtMillions, fmtPct } from "@/lib/calculations";

const LADDER_ORDER = ["Daily", "Quarterly", "Annual", "Multi-Year", "Illiquid"];

export default async function LiquidityPage() {
  const [holdings, client] = await Promise.all([getHoldingsDetailed(), getActiveClient()]);

  const total = totalValue(holdings) || 1;
  const unfunded = totalUnfundedOf(holdings);
  const ladder = breakdownBy(holdings, (h) => h.liquidity).sort(
    (a, b) => LADDER_ORDER.indexOf(a.label) - LADDER_ORDER.indexOf(b.label),
  );
  const daily = ladder.find((l) => l.label === "Daily")?.value ?? 0;
  const quarterly = ladder.find((l) => l.label === "Quarterly")?.value ?? 0;
  const accessible = daily + quarterly;
  const coverage = unfunded > 0 ? daily / unfunded : null;

  const unfundedHoldings = holdings
    .filter((h) => (h.unfunded ?? 0) > 0)
    .sort((a, b) => (b.unfunded ?? 0) - (a.unfunded ?? 0));
  const unfundedByEntity = breakdownBy(unfundedHoldings, (h) => h.entityName || "Managed Accounts")
    .map((row) => ({
      ...row,
      unfunded: unfundedHoldings
        .filter((h) => (h.entityName || "Managed Accounts") === row.label)
        .reduce((s, h) => s + (h.unfunded ?? 0), 0),
    }))
    .sort((a, b) => b.unfunded - a.unfunded);

  return (
    <div>
      <PageHeader
        eyebrow="Liquidity Planning"
        title="Can we meet every obligation without forced selling?"
        lede="Liquidity discipline means knowing how quickly capital can be accessed, and holding enough in reliable form to meet capital calls and family needs without selling long-term assets at the wrong time."
        status={{ label: "Discussion Point", tone: "info" }}
        client={{ name: client.name, asOf: client.asOf }}
      />

      {/* Summary band */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Daily-liquid assets"
            value={fmtMillions(daily)}
            sub={`${fmtPct((daily / total) * 100, 0)} of investments`}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Accessible ≤ quarterly"
            value={fmtMillions(accessible)}
            sub={`${fmtPct((accessible / total) * 100, 0)} of investments`}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Unfunded commitments"
            value={fmtMillions(unfunded)}
            sub="Callable by managers"
            tone="caution"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Call coverage"
            value={coverage != null ? `${coverage.toFixed(1)}×` : "—"}
            sub="Daily-liquid ÷ unfunded"
            tone={coverage != null && coverage < 1 ? "critical" : "positive"}
          />
        </Panel>
      </div>

      {/* Liquidity ladder */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Access"
          title="The liquidity ladder"
          description="How quickly each tier of the portfolio can be converted to cash, from daily-liquid securities to multi-year fund structures and directly held assets."
        />
        <Panel inset>
          <ul className="divide-y divide-hairline">
            {ladder.map((l) => (
              <li
                key={l.label}
                className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-[140px_1fr_220px] sm:items-center"
              >
                <StatusPill
                  tone={l.label === "Daily" ? "positive" : l.label === "Illiquid" ? "critical" : "caution"}
                  dot={false}
                >
                  {l.label}
                </StatusPill>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-brand/70" style={{ width: `${l.pct}%` }} />
                </div>
                <p className="tnum text-right text-[13px] text-ink">
                  <span className="font-medium">{fmtMillions(l.value, 1)}</span>
                  <span className="text-ink-muted">
                    {" "}
                    · {fmtPct(l.pct)} · {l.count} positions
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      {/* Unfunded by entity */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Obligations"
          title="Unfunded commitments by entity"
          description="Where future capital calls will land. Calls are drawn at the manager's discretion, typically over the next several years."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {unfundedByEntity.map((e) => (
            <Panel key={e.label} className="p-5">
              <p className="truncate text-[14px] font-medium text-ink">{e.label}</p>
              <p className="tnum mt-1 text-[20px] font-medium text-caution">
                {fmtMillions(e.unfunded, 2)}
              </p>
              <p className="text-[12px] text-ink-muted">{e.count} commitments</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* Largest unfunded positions */}
      <section>
        <SectionHeading eyebrow="Detail" title="Largest outstanding commitments" />
        <Panel inset className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {["Holding", "Entity", "Committed", "Contributed", "Unfunded"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 font-medium text-ink-muted ${i >= 2 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {unfundedHoldings.slice(0, 12).map((h) => (
                <tr key={h.id}>
                  <td className="max-w-[280px] truncate px-5 py-3 font-medium text-ink">{h.name}</td>
                  <td className="px-5 py-3 text-ink-muted">{h.entityName || "Managed Accounts"}</td>
                  <td className="tnum px-5 py-3 text-right text-ink-muted">
                    {h.commitment ? fmtMillions(h.commitment, 2) : "—"}
                  </td>
                  <td className="tnum px-5 py-3 text-right text-ink-muted">
                    {h.contributions ? fmtMillions(h.contributions, 2) : "—"}
                  </td>
                  <td className="tnum px-5 py-3 text-right font-medium text-caution">
                    {fmtMillions(h.unfunded ?? 0, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Liquidity tiers are classified from each holding&apos;s structure and may differ
        from actual redemption terms. Nothing here is investment advice — liquidity
        planning decisions are made with your advisor.
      </p>
    </div>
  );
}
