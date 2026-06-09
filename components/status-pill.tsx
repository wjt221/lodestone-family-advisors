import { cn } from "@/lib/utils";

export type Tone = "critical" | "caution" | "positive" | "info" | "neutral";

const TONE_STYLES: Record<Tone, string> = {
  critical: "border-critical/25 bg-critical-soft text-critical",
  caution: "border-caution/25 bg-caution-soft text-caution",
  positive: "border-positive/25 bg-positive-soft text-positive",
  info: "border-info/25 bg-info-soft text-info",
  neutral: "border-hairline bg-secondary text-ink-muted",
};

const DOT_STYLES: Record<Tone, string> = {
  critical: "bg-critical",
  caution: "bg-caution",
  positive: "bg-positive",
  info: "bg-info",
  neutral: "bg-ink-muted",
};

// Map the product's review-status vocabulary to a tone so usage stays consistent.
const LABEL_TONE: Record<string, Tone> = {
  "Advisor Review Required": "critical",
  "Requires Advisor Approval": "critical",
  "Risk to Review": "caution",
  "Decision for Investment Committee": "caution",
  "Discussion Point": "info",
  "Proposed Framework": "info",
  "Governance Improvement": "info",
  "Opportunity to Evaluate": "info",
  "Draft for Advisor Review": "caution",
  "Within range": "positive",
  "Below range": "critical",
  "Above range": "caution",
  Complete: "positive",
  "In Review": "caution",
  Draft: "info",
  Final: "positive",
  Monitoring: "neutral",
};

export function toneForLabel(label: string): Tone {
  return LABEL_TONE[label] ?? "neutral";
}

interface StatusPillProps {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

export function StatusPill({
  children,
  tone,
  dot = true,
  className,
}: StatusPillProps) {
  const resolved =
    tone ?? (typeof children === "string" ? toneForLabel(children) : "neutral");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium",
        TONE_STYLES[resolved],
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[resolved])} />
      )}
      {children}
    </span>
  );
}
