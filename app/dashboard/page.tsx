import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AllocationChart } from "@/components/allocation-chart";
import {
  CLIENT,
  HOLDINGS,
  PERFORMANCE,
  MEETINGS,
  ACTIVITY_FEED,
} from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Calendar, Activity } from "lucide-react";

function fmt(n: number) {
  return n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;
}

export default function DashboardPage() {
  const upcomingMeetings = MEETINGS.filter((m) => m.status === "Scheduled");

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
            Family Office Dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{CLIENT.name}</h1>
          <p className="text-slate-500 mt-1">
            Advisor: {CLIENT.advisor} · {CLIENT.advisorTitle}
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs bg-amber-50 text-amber-700 border-amber-300"
        >
          Illustrative / Mock Data
        </Badge>
      </div>

      {/* AUM + Performance row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="md:col-span-1 border-0 shadow-sm bg-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total AUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{CLIENT.aumFormatted}</p>
            <p className="text-xs text-blue-200 mt-1">
              Across {CLIENT.entities.length} entities
            </p>
          </CardContent>
        </Card>

        {[
          { label: "YTD Return", value: PERFORMANCE.ytd, bench: PERFORMANCE.benchmarkYtd },
          { label: "1-Year Return", value: PERFORMANCE.oneYear, bench: PERFORMANCE.benchmarkOneYear },
          { label: "Since Inception", value: PERFORMANCE.inception, bench: null },
        ].map((p) => (
          <Card key={p.label} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {p.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {p.value >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className="text-2xl font-bold text-slate-900">
                  {fmt(p.value)}
                </span>
              </div>
              {p.bench !== null && (
                <p className="text-xs text-slate-400 mt-1">
                  Benchmark: {fmt(p.bench)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Asset Allocation
            </CardTitle>
            <p className="text-xs text-slate-400">
              Illustrative figures — for discussion purposes only
            </p>
          </CardHeader>
          <CardContent>
            <AllocationChart />
          </CardContent>
        </Card>

        {/* Holdings table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Holdings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {HOLDINGS.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: h.color }}
                    />
                    <span className="text-xs text-slate-700 truncate">
                      {h.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-900 ml-2 shrink-0">
                    {h.allocationPct}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming meetings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base font-semibold text-slate-900">
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMeetings.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <p className="text-sm font-medium text-slate-900">{m.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {m.date} · {m.time}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base font-semibold text-slate-900">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACTIVITY_FEED.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-800">
                    <span className="font-medium">{a.action}:</span> {a.detail}
                  </p>
                  <p className="text-xs text-slate-400">
                    {a.date} · {a.user}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        All portfolio values and performance figures shown are illustrative mock data for demonstration purposes only. This is not investment advice.
      </p>
    </div>
  );
}
