import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { HOLDINGS } from "@/lib/mock-data";

function formatCurrency(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

const MOCK_VINTAGES: Record<string, string> = {
  cash: "Ongoing",
  muni: "2021",
  equity: "2020",
  credit: "2022",
  industrial: "2023",
  realestate: "2021",
  venture: "2023",
  roofing: "2024",
};

const MOCK_STATUS: Record<string, string> = {
  cash: "Active",
  muni: "Active",
  equity: "Active",
  credit: "Active",
  industrial: "Active",
  realestate: "Active",
  venture: "Active",
  roofing: "Active",
};

export default function InvestmentsPage() {
  return (
    <div>
      <Header
        title="Investment Tracking"
        subtitle="All active investments across the Atwater Family Office"
      />

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Investments</CardTitle>
          <p className="text-xs text-slate-400">Illustrative data — for discussion only</p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-6 py-3 font-medium">Investment</th>
                <th className="text-left px-6 py-3 font-medium">Category</th>
                <th className="text-left px-6 py-3 font-medium">Vintage</th>
                <th className="text-right px-6 py-3 font-medium">Current Value</th>
                <th className="text-right px-6 py-3 font-medium">Allocation</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {HOLDINGS.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: h.color }}
                      />
                      <span className="font-medium text-slate-900">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{h.category}</td>
                  <td className="px-6 py-4 text-slate-600">{MOCK_VINTAGES[h.id]}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-900">
                    {formatCurrency(h.value)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-900">
                    {h.allocationPct}%
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                      {MOCK_STATUS[h.id]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        All values are illustrative mock data. This is not investment advice.
      </p>
    </div>
  );
}
