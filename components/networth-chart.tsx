"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { NETWORTH_TREND } from "@/lib/mock-data";

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-hairline bg-card px-3 py-2 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="tnum text-[13px] font-medium text-ink">
        ${payload[0].value.toFixed(1)}M
      </p>
    </div>
  );
}

export function NetWorthChart({ height = 200 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={NETWORTH_TREND}
          margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
        >
          <defs>
            <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--ink-muted)" }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--ink-muted)" }}
            tickFormatter={(v) => `$${v}M`}
            width={46}
            domain={["dataMin - 3", "dataMax + 2"]}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--hairline)" }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="url(#nw)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--brand)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
