"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Check } from "lucide-react";
import { switchClient } from "@/lib/actions/switch-client";
import type { ClientSummary } from "@/lib/data/clients";
import { cn } from "@/lib/utils";

interface Props {
  clients: ClientSummary[];
  activeClientId: string | null;
}

export function ClientSwitcher({ clients, activeClientId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (clients.length < 2) return null;

  const active = clients.find((c) => c.id === activeClientId) ?? clients[0];

  function select(clientId: string) {
    if (clientId === activeClientId) { setOpen(false); return; }
    setOpen(false);
    startTransition(async () => {
      await switchClient(clientId);
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="relative px-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent disabled:opacity-50"
      >
        <Building2 className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
        <span className="flex-1 truncate text-[12px] text-sidebar-foreground/70">
          {isPending ? "Switching…" : (active?.shortName ?? active?.name)}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 text-sidebar-foreground/40 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-sidebar-border bg-sidebar py-1 shadow-xl">
            {clients.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => select(c.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-sidebar-accent"
              >
                <Check
                  className={cn(
                    "h-3 w-3 shrink-0",
                    c.id === activeClientId ? "text-brand" : "opacity-0",
                  )}
                />
                <div className="min-w-0">
                  <p className={cn(
                    "truncate text-[12px]",
                    c.id === activeClientId ? "text-sidebar-foreground" : "text-sidebar-foreground/60",
                  )}>
                    {c.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
