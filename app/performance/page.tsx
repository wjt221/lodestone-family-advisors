import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { Stat } from "@/components/stat";
import { StatusPill } from "@/components/status-pill";
import { getPerformance, type PerformanceView } from "@/lib/data/performance";
import { getActiveClient } from "@/lib/data/clients";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { fmtMillions } from "@/lib/calculations";

const pct = (v: number | null, digits = 1) =>
  v == null ? "—" : `${(v * 100).toFixed(digits)}%`;
const signedPct = (v: number | null, digits = 1) =>
  v == null ? "—" : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(digits)}%`;
const excessTone = (v: number | null) =>
  v == null ? "neutral" : v >= 0 ? "positive" : "caution";

function ReturnsTable({
  rows,
  benchmarkLabel,
}: {
  rows: PerformanceView[];
  benchmarkLabel: string;
}) {
  return (
    <Panel inset className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-[13px]">
        <thead>
          <tr className="border-b border-hairline">
            {["", "Amount", "Return (net)", benchmarkLabel, "Excess"].map((h, i) => (
              <th
                key={h || "label"}
                className={`px-5 py-3 font-medium text-ink-muted ${i >= 1 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {rows.map((r) => (
            <tr key={r.label} className="transition-colors hover:bg-secondary/40">
              <td className="px-5 py-3.5 font-medium text-ink">{r.label}</td>
              <td className="tnum px-5 py-3.5 text-right text-ink-muted">
                {r.amount != null ? fmtMillions(r.amount, 2) : "—"}
              </td>
              <td className="tnum px-5 py-3.5 text-right font-medium text-ink">
                {pct(r.returnNet)}
              </td>
              <td className="tnum px-5 py-3.5 text-right text-ink-muted">
                {pct(r.benchmarkReturn)}
              </td>
              <td className="px-5 py-3.5 text-right">
                <StatusPill tone={excessTone(r.excessReturn)} dot={false}>
                  {signedPct(r.excessReturn)}
                </StatusPill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export default async function PerformancePage() {
  const [performance, client, holdings] = await Promise.all([
    getPerformance(),
    getActiveClient(),
    getHoldingsDetailed(),
  ]);

  // Lodestone-sourced deals are identified by manager on the schedule.
  const lodestoneDeals = holdings.filter((h) => /lodestone/i.test(h.manager));

  const byScope = (s: string) => performance.filter((p) => p.scope === s);
  const assetClasses = byScope("asset_class");
  const internal = byScope("internal_asset_class");
  const entities = byScope("entity");
  const total = byScope("total")[0] ?? null;
  const other = byScope("other");
  const business = other.find((o) => /business/i.test(o.label)) ?? null;
  const totalAssets = other.find((o) => /total assets/i.test(o.label)) ?? null;
  const asOf = total?.asOf || client.asOf;

  const vsExpected = total && total.returnNet != null && total.expectedReturn != null
    ? total.returnNet - total.expectedReturn
    : null;

  return (
    <div>
      <PageHeader
        eyebrow="Performance Review"
        title="Returns against expectations"
        lede="Since-inception returns by asset class against the expected-return framework and benchmarks, plus the family's internally directed portfolio, entity-level results, and Lodestone-sourced investments."
        status={{ label: "Discussion Point", tone: "info" }}
        client={{ name: client.name, asOf }}
      />

      {/* Summary band */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-5">
          <Stat
            label="Total investments"
            value={total?.amount != null ? fmtMillions(total.amount) : "—"}
            sub={`Return ${pct(total?.returnNet ?? null)} (net, since-inception IRR)`}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Vs expected return"
            value={signedPct(vsExpected)}
            sub={`Expected ${pct(total?.expectedReturn ?? null)}`}
            tone={vsExpected != null && vsExpected >= 0 ? "positive" : "caution"}
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Business ownership"
            value={business?.amount != null ? fmtMillions(business.amount) : "—"}
            sub="Held outside the investment portfolio"
          />
        </Panel>
        <Panel className="p-5">
          <Stat
            label="Total assets"
            value={totalAssets?.amount != null ? fmtMillions(totalAssets.amount) : "—"}
            sub="Investments + business ownership"
          />
        </Panel>
      </div>

      {/* Asset-class returns vs expectations */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="By asset class"
          title="Returns vs. the expected-return framework"
          description="Each asset class against the long-term expected return assumed in the strategic allocation. Persistent gaps become discussion points, not trades."
        />
        <Panel inset className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline">
                {["Asset class", "Amount", "Actual %", "Target %", "Return (net)", "Expected", "Vs expected"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 font-medium text-ink-muted ${i >= 1 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {assetClasses.map((r) => {
                const delta =
                  r.returnNet != null && r.expectedReturn != null
                    ? r.returnNet - r.expectedReturn
                    : null;
                return (
                  <tr key={r.label} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3.5 font-medium text-ink">{r.label}</td>
                    <td className="tnum px-5 py-3.5 text-right text-ink-muted">
                      {r.amount != null ? fmtMillions(r.amount, 2) : "—"}
                    </td>
                    <td className="tnum px-5 py-3.5 text-right text-ink">{pct(r.actualPct)}</td>
                    <td className="tnum px-5 py-3.5 text-right text-ink-muted">{pct(r.targetPct, 0)}</td>
                    <td className="tnum px-5 py-3.5 text-right font-medium text-ink">{pct(r.returnNet)}</td>
                    <td className="tnum px-5 py-3.5 text-right text-ink-muted">{pct(r.expectedReturn)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <StatusPill tone={excessTone(delta)} dot={false}>
                        {signedPct(delta)}
                      </StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </section>

      {/* Lodestone-sourced investments */}
      {lodestoneDeals.length > 0 && (
        <section className="mb-10">
          <SectionHeading
            eyebrow="Lodestone-sourced"
            title="Lodestone investments"
            description="Opportunities sourced and structured by Lodestone Family Advisors."
          />
          <Panel inset className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13px]">
              <thead>
                <tr className="border-b border-hairline">
                  {["Investment", "Entity", "Strategy", "Committed", "Value", "Result"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 font-medium text-ink-muted ${i >= 3 && i < 5 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {lodestoneDeals.map((h) => (
                  <tr key={h.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{h.name}</p>
                      <p className="text-[11.5px] text-ink-muted">
                        {h.structure}
                        {h.vintage ? ` · ${h.vintage}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{h.entityName}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{h.strategy}</td>
                    <td className="tnum px-5 py-3.5 text-right text-ink-muted">
                      {h.commitment ? fmtMillions(h.commitment, 2) : "—"}
                    </td>
                    <td className="tnum px-5 py-3.5 text-right font-medium text-ink">
                      {fmtMillions(h.value, 2)}
                    </td>
                    <td className="px-5 py-3.5">
                      {/IRR|MOIC|\d+(\.\d+)?x/i.test(h.note) ? (
                        <StatusPill tone="positive" dot={false}>
                          {h.note}
                        </StatusPill>
                      ) : (
                        <span className="text-[12px] text-ink-muted">
                          {h.note || "Held at cost"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </section>
      )}

      {/* Internal portfolio vs benchmark */}
      {internal.length > 0 && (
        <section className="mb-10">
          <SectionHeading
            eyebrow="Family-directed"
            title="Internal portfolio vs. benchmark"
            description="The family's internally directed capital, measured against public-market-equivalent benchmarks (since-inception IRR, 2016)."
          />
          <ReturnsTable rows={internal} benchmarkLabel="Benchmark" />
        </section>
      )}

      {/* Entity-level */}
      {entities.length > 0 && (
        <section>
          <SectionHeading
            eyebrow="By entity"
            title="Entity-level results"
            description="The same internal capital grouped by holding entity."
          />
          <ReturnsTable rows={entities} benchmarkLabel="Benchmark" />
        </section>
      )}

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Returns are net, since-inception IRRs calculated from capital activity and
        the most recent available marks; private-asset values may lag. Benchmark
        returns are calculated against public-market equivalents over matching
        periods. Past performance does not guarantee future results. Nothing here is
        investment advice — performance is reviewed with your advisor and the
        Investment Committee.
      </p>
    </div>
  );
}
