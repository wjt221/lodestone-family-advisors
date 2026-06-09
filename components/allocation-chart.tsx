"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { allocationByClass, fmtMillions, fmtPct } from "@/lib/calculations";
import { CLIENT } from "@/lib/mock-data";

interface TooltipItem {
  name: string;
  value: number;
  payload: { value: number; rawValue: number };
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipItem[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-hairline bg-card px-3 py-2 shadow-sm">
      <p className="text-[12px] font-medium text-ink">{d.name}</p>
      <p className="tnum text-[12px] text-ink-muted">
        {fmtPct(d.value)} · {fmtMillions(d.payload.rawValue, 2)}
      </p>
    </div>
  );
}

export function AllocationChart({ height = 260 }: { height?: number }) {
  const data = allocationByClass().map((c) => ({
    name: c.assetClass,
    value: c.pct,
    rawValue: c.value,
    color: c.color,
  }));

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={1.5}
            dataKey="value"
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="eyebrow">Total AUM</p>
        <p className="tnum font-serif text-[28px] font-medium leading-none text-ink">
          {CLIENT.aum >= 1_000_000 ? `$${(CLIENT.aum / 1_000_000).toFixed(1)}M` : ""}
        </p>
      </div>
    </div>
  );
}
