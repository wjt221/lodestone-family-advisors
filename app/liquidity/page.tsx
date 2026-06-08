import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { ComplianceBadge } from "@/components/compliance-badge";
import { HOLDINGS, CLIENT, IPS_SUMMARY } from "@/lib/mock-data";

function formatCurrency(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

const LIQUIDITY_TIERS: Record<string, { tier: string; days: string }> = {
  cash: { tier: "T0", days: "Immediately available" },
  muni: { tier: "T1", days: "1–5 business days" },
  equity: { tier: "T1", days: "T+2 settlement" },
  credit: { tier: "T3", days: "90–180 day notice" },
  industrial: { tier: "T4", days: "Illiquid / multi-year" },
  realestate: { tier: "T3", days: "6–24 month hold" },
  venture: { tier: "T4", days: "Illiquid / fund life" },
  roofing: { tier: "T4", days: "Illiquid / multi-year" },
};

const TIER_COLORS: Record<string, string> = {
  T0: "bg-green-100 text-green-800",
  T1: "bg-blue-100 text-blue-800",
  T3: "bg-amber-100 text-amber-800",
  T4: "bg-red-100 text-red-800",
};

export default function LiquidityPage() {
  const liquidAssets = HOLDINGS.filter((h) =>
    ["cash", "muni", "equity"].includes(h.id)
  );
  const liquidValue = liquidAssets.reduce((s, h) => s + h.value, 0);
  const liquidPct = ((liquidValue / CLIENT.aum) * 100).toFixed(1);
  const requirement = parseFloat(IPS_SUMMARY.liquidityNeeds.match(/\d+/)![0]);

  return (
    <div>
      <Header
        title="Liquidity Analysis"
        subtitle="Tiered liquidity profile across all holdings"
        showCompliance
        complianceVariant="discussion"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Liquid Assets (T0–T1)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(liquidValue)}
            </p>
            <p className="text-sm text-slate-500 mt-1">{liquidPct}% of AUM</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              IPS Liquidity Floor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{requirement}%</p>
            <p className="text-sm text-slate-500 mt-1">Minimum liquid requirement</p>
          </CardContent>
        </Card>

        <Card
          className={`border-0 shadow-sm ${
            parseFloat(liquidPct) >= requirement ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-xl font-bold ${
                parseFloat(liquidPct) >= requirement
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {parseFloat(liquidPct) >= requirement
                ? "Within IPS Guideline"
                : "Below IPS Guideline"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Discussion Point</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Liquidity by Holding
            </CardTitle>
            <ComplianceBadge variant="discussion" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-6 py-3 font-medium">Holding</th>
                <th className="text-left px-6 py-3 font-medium">Tier</th>
                <th className="text-left px-6 py-3 font-medium">Liquidity</th>
                <th className="text-right px-6 py-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {HOLDINGS.map((h) => {
                const liq = LIQUIDITY_TIERS[h.id];
                return (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {h.name}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          TIER_COLORS[liq.tier]
                        }`}
                      >
                        {liq.tier}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600 text-xs">
                      {liq.days}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-slate-900">
                      {formatCurrency(h.value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        Discussion Point — liquidity tiers are illustrative. Requires advisor review.
      </p>
    </div>
  );
}
