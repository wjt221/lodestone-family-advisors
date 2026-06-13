import { getSessionContext, isDemoMode } from "@/lib/data/session";
import { getActiveClient } from "@/lib/data/clients";
import { getClientIPS } from "@/lib/data/ips";
import { IPSWorkbench } from "@/components/ips/workbench";

// The Advisor-Led IPS Workbench. Client-specific: every profile is scoped to the
// active client's id and never shared across clients.
export default async function IpsPage() {
  const [ctx, client] = await Promise.all([getSessionContext(), getActiveClient()]);
  const demo = isDemoMode();
  const canEdit = demo || ctx.role === "advisor" || ctx.role === "admin";

  // clientId for persistence: the live client id in secure mode, the mock id in demo.
  const clientId = ctx.clientId ?? client.id ?? "mock-atwater";
  const initialProfile = await getClientIPS();

  return (
    <IPSWorkbench
      initialProfile={initialProfile}
      clientId={clientId}
      clientName={client.name}
      clientAsOf={client.asOf}
      demoMode={demo}
      canEdit={canEdit}
    />
  );
}
