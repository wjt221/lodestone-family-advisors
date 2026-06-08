import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { HOLDINGS, CLIENT } from "@/lib/mock-data";

function formatCurrency(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

const CATEGORY_COLORS: Record<string, string> = {
  Liquid: "bg-slate-100 text-slate-700",
  "Fixed Income": "bg-blue-100 text-blue-700",
  "Public Equity": "bg-green-100 text-green-700",
  "Private Credit": "bg-amber-100 text-amber-700",
  "Direct Investment": "bg-purple-100 text-purple-700",
  "Real Assets": "bg-orange-100 text-orange-700",
  "Venture / PE": "bg-pink-100 text-pink-700",
};

export default function PortfolioPage() {
  const total = HOLDINGS.reduce((s, h) => s + h.value, 0);

  return (
    <div>
      <Header
        title="Portfolio Holdings"
        subtitle={`Total AUM: ${CLIENT.aumFormatted} across ${CLIENT.entities.length} entities`}
      />

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">All Holdings</CardTitle>
            <span className="text-xs text-slate-400">Illustrative figures only</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-medium">Holding</th>
                  <th className="text-left px-6 py-3 font-medium">Category</th>
                  <th className="text-right px-6 py-3 font-medium">Value</th>
                  <th className="text-right px-6 py-3 font-medium">Allocation</th>
                  <th className="text-right px-6 py-3 font-medium">Weight vs Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {HOLDINGS.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ background: h.color }}
                        />
                        <span className="font-medium text-slate-900">{h.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${CATEGORY_COLORS[h.category] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {h.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900">
                      {formatCurrency(h.value)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{ width: `${h.allocationPct}%` }}
                          />
                        </div>
                        <span className="text-slate-900 font-medium w-8 text-right">
                          {h.allocationPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs">
                      {((h.value / total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={2} className="px-6 py-4 font-semibold text-slate-900">
                    Total
                  </td>
                  <td className="px-6 py-4 text-right font-semibold font-mono text-slate-900">
                    {formatCurrency(total)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">100%</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        All values are illustrative mock data. Not investment advice.
      </p>
    </div>
  );
}
