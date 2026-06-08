"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HOLDINGS } from "@/lib/mock-data";

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { value: number; name: string; color: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (active && payload && payload.length) {
    const d = payload[0];
    const holding = HOLDINGS.find((h) => h.name === d.name);
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-900 mb-1">{d.name}</p>
        <p className="text-slate-600">{d.value}% of portfolio</p>
        {holding && (
          <p className="text-slate-600">{formatCurrency(holding.value)}</p>
        )}
      </div>
    );
  }
  return null;
}

export function AllocationChart() {
  const data = HOLDINGS.map((h) => ({
    name: h.name,
    value: h.allocationPct,
    color: h.color,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
