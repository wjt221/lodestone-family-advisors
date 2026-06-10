import { PageHeader } from "@/components/page-header";
import { getHoldingsDetailed } from "@/lib/data/holdings";
import { getActiveClient } from "@/lib/data/clients";
import { HoldingsTable } from "./holdings-table";

export default async function HoldingsPage() {
  const [holdings, client] = await Promise.all([
    getHoldingsDetailed(),
    getActiveClient(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Holdings ledger"
        lede="All positions in one place. Sort and filter by any column, add a new holding for advisor review, or remove a position from the working view."
        status={{ label: "Draft for Advisor Review", tone: "caution" }}
        client={{ name: client.name, asOf: client.asOf }}
      />
      <HoldingsTable initial={holdings} />
    </div>
  );
}
