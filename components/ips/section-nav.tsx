"use client";

// Left-rail navigation across the eleven IPS sections plus the Summary, each
// showing its section status as a colored dot.

import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { SECTION_CONFIG } from "@/lib/ips/ipsDefaults";
import type { SectionStatus, IPSSectionKey } from "@/lib/ips/ipsTypes";

const DOT: Record<SectionStatus, string> = {
  not_started: "bg-hairline",
  in_progress: "bg-info",
  complete: "bg-positive",
  skipped: "bg-ink-muted/40",
  not_applicable: "bg-ink-muted/40",
  needs_follow_up: "bg-caution",
};

export type NavTarget = IPSSectionKey | "summary";

export function IPSSectionNav({
  active,
  statuses,
  onSelect,
}: {
  active: NavTarget;
  statuses: Record<IPSSectionKey, SectionStatus>;
  onSelect: (target: NavTarget) => void;
}) {
  return (
    <nav className="space-y-0.5">
      {SECTION_CONFIG.map((s, i) => {
        const on = active === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelect(s.key)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
              on ? "bg-secondary font-medium text-ink" : "text-ink-muted hover:bg-secondary/60 hover:text-ink",
            )}
          >
            <span className="tnum w-4 shrink-0 text-[11px] text-ink-muted/70">{i + 1}</span>
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[statuses[s.key]])} />
            <span className="truncate">{s.shortTitle}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onSelect("summary")}
        className={cn(
          "mt-1 flex w-full items-center gap-2.5 rounded-md border-t border-hairline px-2.5 py-2 pt-3 text-left text-[13px] transition-colors",
          active === "summary" ? "font-medium text-ink" : "text-ink-muted hover:text-ink",
        )}
      >
        <FileText className="h-3.5 w-3.5 shrink-0 text-brand" />
        <span>Advisor-Facilitated IPS Draft</span>
      </button>
    </nav>
  );
}
