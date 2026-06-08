import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { ComplianceBadge } from "@/components/compliance-badge";
import { IPS_SUMMARY } from "@/lib/mock-data";

export default function IpsPage() {
  return (
    <div>
      <Header
        title="Investment Policy Statement"
        subtitle="IPS for Atwater Family Office — 2026"
        showCompliance
        complianceVariant="approved"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Investment Objective
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{IPS_SUMMARY.objective}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Key Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Time Horizon</span>
              <span className="font-medium text-slate-900">
                {IPS_SUMMARY.timeHorizon}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Risk Tolerance</span>
              <span className="font-medium text-slate-900">
                {IPS_SUMMARY.riskTolerance}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Liquidity Requirement</span>
              <span className="font-medium text-slate-900">
                {IPS_SUMMARY.liquidityNeeds}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Investment Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {IPS_SUMMARY.restrictions.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Target Allocation
              </CardTitle>
              <ComplianceBadge variant="approved" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(IPS_SUMMARY.targetAllocation).map(([key, pct]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-xs font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-1.5 bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        This IPS is a discussion document. All figures are illustrative. Not investment advice.
      </p>
    </div>
  );
}
