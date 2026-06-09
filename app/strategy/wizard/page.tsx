import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { isDemoMode } from "@/lib/data/session";
import { getActiveClient } from "@/lib/data/clients";
import { StrategyWizard } from "./wizard-client";

export default async function StrategyWizardPage() {
  // The discovery workspace operates on demo data only; never show it to live clients.
  if (!isDemoMode()) {
    const client = await getActiveClient();
    return (
      <div>
        <PageHeader
          eyebrow="Discovery Workspace"
          title="Guided discovery"
          lede="A guided, multi-step intake that drafts the family's discovery record for advisor review."
          status={{ label: "In Preparation", tone: "info" }}
          client={{ name: client.name, asOf: client.asOf }}
        />
        <EmptyState
          title="The discovery workspace is being prepared"
          description="Your advisor will open the guided discovery here when the family review begins."
        />
      </div>
    );
  }

  return <StrategyWizard />;
}
