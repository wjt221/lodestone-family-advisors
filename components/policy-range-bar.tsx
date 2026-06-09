import { cn } from "@/lib/utils";
import type { RangeStatus } from "@/lib/calculations";

interface PolicyRangeBarProps {
  current: number;
  min: number;
  target: number;
  max: number;
  status: RangeStatus;
  scaleMax?: number;
}

const MARKER: Record<RangeStatus, string> = {
  "Within range": "bg-positive",
  "Below range": "bg-critical",
  "Above range": "bg-caution",
};

/**
 * Renders a position within a policy band: a shaded min–max range, a target
 * tick, and the current marker. Frames allocation as discipline, not a target trade.
 */
export function PolicyRangeBar({
  current,
  min,
  target,
  max,
  status,
  scaleMax,
}: PolicyRangeBarProps) {
  const domain = scaleMax ?? Math.ceil((Math.max(max, current) * 1.25) / 5) * 5;
  const pos = (v: number) => `${Math.min(100, (v / domain) * 100)}%`;

  return (
    <div className="relative h-6 w-full">
      {/* base track */}
      <div className="absolute inset-y-2.5 left-0 right-0 rounded-full bg-secondary" />
      {/* policy range band */}
      <div
        className="absolute inset-y-2 rounded-full bg-brand/15"
        style={{ left: pos(min), width: `calc(${pos(max)} - ${pos(min)})` }}
      />
      {/* target tick */}
      <div
        className="absolute inset-y-1 w-px bg-brand/70"
        style={{ left: pos(target) }}
      />
      {/* current marker */}
      <div
        className={cn(
          "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card",
          MARKER[status],
        )}
        style={{ left: pos(current) }}
      />
    </div>
  );
}
