import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { getSessionContext } from "@/lib/data/session";
import { getAllAccessibleClients } from "@/lib/data/clients";
import type { UserRole } from "@/lib/supabase/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  const isStaff = ctx.role === "advisor" || ctx.role === "admin";
  const clients = isStaff ? await getAllAccessibleClients() : [];

  const role = ctx.role as UserRole;
  const activeClientId = ctx.clientId ?? null;

  return (
    <>
      <MobileNav role={role} clients={clients} activeClientId={activeClientId} />
      <div className="flex min-h-screen">
        <Sidebar role={role} clients={clients} activeClientId={activeClientId} />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-8 md:py-10 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
