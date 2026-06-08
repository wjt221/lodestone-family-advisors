import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { ComplianceBadge } from "@/components/compliance-badge";
import { IPS_SUMMARY, HOLDINGS } from "@/lib/mock-data";

const RISK_FACTORS = [
  {
    factor: "Market Risk",
    score: 65,
    description: "Exposure to public equity and bond market volatility",
    category: "Medium-High",
  },
  {
    factor: "Liquidity Risk",
    score: 45,
    description: "33% of assets in illiquid/long-hold investments",
    category: "Medium",
  },
  {
    factor: "Concentration Risk",
    score: 30,
    description: "Portfolio spread across 8 distinct holdings",
    category: "Low-Medium",
  },
  {
    factor: "Credit Risk",
    score: 40,
    description: "Private credit and municipal bond exposure",
    category: "Medium",
  },
  {
    factor: "Manager Risk",
    score: 35,
    description: "Dependence on external fund managers",
    category: "Low-Medium",
  },
];

const SCORE_COLORS: Record<string, string> = {
  "Low-Medium": "text-green-700",
  Medium: "text-amber-700",
  "Medium-High": "text-orange-700",
  High: "text-red-700",
};

export default function RiskPage() {
  const illiquidPct = HOLDINGS.filter((h) =>
    ["credit", "industrial", "realestate", "venture", "roofing"].includes(h.id)
  ).reduce((s, h) => s + h.allocationPct, 0);

  return (
    <div>
      <Header
        title="Risk Assessment"
        subtitle="Portfolio risk framework — discussion purposes only"
        showCompliance
        complianceVariant="discussion"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              IPS Risk Tolerance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">
              {IPS_SUMMARY.riskTolerance}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Illiquid Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{illiquidPct}%</p>
            <p className="text-xs text-slate-500 mt-1">of total portfolio</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Number of Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{HOLDINGS.length}</p>
            <p className="text-xs text-slate-500 mt-1">distinct investments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Risk Factor Assessment
            </CardTitle>
            <ComplianceBadge variant="discussion" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {RISK_FACTORS.map((r) => (
            <div key={r.factor}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-900">
                  {r.factor}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    SCORE_COLORS[r.category] ?? "text-slate-600"
                  }`}
                >
                  {r.category}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full mb-1">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${r.score}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{r.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-slate-400">
        Risk scores are illustrative discussion points only. Requires advisor review. Not investment advice.
      </p>
    </div>
  );
}
