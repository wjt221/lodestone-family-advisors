import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";
import type { AttentionItem } from "@/lib/mock-data";

const ACCENT: Record<AttentionItem["tone"], string> = {
  critical: "before:bg-critical",
  caution: "before:bg-caution",
  info: "before:bg-info",
};

const PILL_TONE: Record<AttentionItem["tone"], "critical" | "caution" | "info"> = {
  critical: "critical",
  caution: "caution",
  info: "info",
};

/** A single review flag — the core "what needs attention" unit. Never a recommendation. */
export function ReviewFlag({ item }: { item: AttentionItem }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative block rounded-lg border border-hairline bg-card px-5 py-4 pl-6 transition-colors hover:border-ink/15 hover:bg-secondary/40",
        "before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full",
        ACCENT[item.tone],
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <StatusPill tone={PILL_TONE[item.tone]}>{item.label}</StatusPill>
          </div>
          <p className="text-[14px] font-medium leading-snug text-ink">
            {item.title}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {item.detail}
          </p>
        </div>
        <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors group-hover:text-brand">
          <span className="hidden sm:inline">{item.cta}</span>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
