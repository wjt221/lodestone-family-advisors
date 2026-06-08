import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { AllocationChart } from "@/components/allocation-chart";
import { ComplianceBadge } from "@/components/compliance-badge";
import { HOLDINGS, IPS_SUMMARY } from "@/lib/mock-data";

function formatCurrency(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

export default function AllocationPage() {
  return (
    <div>
      <Header
        title="Allocation Analysis"
        subtitle="Current vs. target allocation framework"
        showCompliance
        complianceVariant="proposed"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Current Allocation
            </CardTitle>
            <p className="text-xs text-slate-400">Illustrative figures only</p>
          </CardHeader>
          <CardContent>
            <AllocationChart />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Current vs. IPS Target
              </CardTitle>
              <ComplianceBadge variant="proposed" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {HOLDINGS.map((h) => (
                <div key={h.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 truncate">{h.name}</span>
                    <span className="font-medium text-slate-900 ml-2">
                      {h.allocationPct}% · {formatCurrency(h.value)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${h.allocationPct}%`, background: h.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                IPS Target Allocation
              </CardTitle>
              <ComplianceBadge variant="approved" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(IPS_SUMMARY.targetAllocation).map(([key, pct]) => (
                <div
                  key={key}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-100"
                >
                  <p className="text-xs text-slate-500 capitalize mb-1">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{pct}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Proposed Framework — requires advisor review. All values illustrative.
      </p>
    </div>
  );
}
