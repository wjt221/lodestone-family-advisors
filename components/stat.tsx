import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "positive" | "caution" | "critical";
  className?: string;
}

const TONE_TEXT = {
  default: "text-ink",
  positive: "text-positive",
  caution: "text-caution",
  critical: "text-critical",
};

/** A single labelled figure. Numbers render with tabular alignment. */
export function Stat({ label, value, sub, tone = "default", className }: StatProps) {
  return (
    <div className={className}>
      <p className="eyebrow">{label}</p>
      <p
        className={cn(
          "tnum mt-2 font-serif text-[26px] font-medium leading-none",
          TONE_TEXT[tone],
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[12px] text-ink-muted">{sub}</p>}
    </div>
  );
}

/** A horizontal label/value row used in detail panels. */
export function MetricRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] text-ink-muted">{label}</p>
        {hint && <p className="text-[11px] text-ink-muted/70">{hint}</p>}
      </div>
      <p className="tnum shrink-0 text-[14px] font-medium text-ink">{value}</p>
    </div>
  );
}
