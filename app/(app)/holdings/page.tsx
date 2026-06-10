import { PageHeader } from "@/components/page-header";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getCashFlowsByHolding } from "@/lib/data/cash-flows";
import { getActiveClient } from "@/lib/data/clients";
import { HoldingsTable } from "./holdings-table";

export default async function HoldingsPage() {
  const [holdings, cashFlowsByHolding, client] = await Promise.all([
    getHoldingsDetailed(),
    getCashFlowsByHolding(),
    getActiveClient(),
  ]);

  // Serialise Map to plain object for client component
  const cashFlows = Object.fromEntries(cashFlowsByHolding);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Holdings ledger"
        lede="All positions in one place. Sort and filter by any column, track IRR and MOIC per asset, add a new holding for advisor review, or remove a position from the working view."
        status={{ label: "Draft for Advisor Review", tone: "caution" }}
        client={{ name: client.name, asOf: client.asOf }}
      />
      <HoldingsTable initial={holdings} initialCashFlows={cashFlows} />
    </div>
  );
}
