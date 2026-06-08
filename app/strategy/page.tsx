import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { ComplianceBadge } from "@/components/compliance-badge";
import { IPS_SUMMARY, CLIENT } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StrategyPage() {
  return (
    <div>
      <Header
        title="Investment Strategy"
        subtitle="High-level framework for the Atwater Family Office"
        showCompliance
        complianceVariant="draft"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Strategy Overview
              </CardTitle>
              <ComplianceBadge variant="draft" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                Primary Objective
              </p>
              <p>{IPS_SUMMARY.objective}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                Time Horizon
              </p>
              <p>{IPS_SUMMARY.timeHorizon}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                Risk Tolerance
              </p>
              <p>{IPS_SUMMARY.riskTolerance}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Client Entities
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {CLIENT.entities.map((e) => (
                <li
                  key={e}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Strategy Wizard
              </CardTitle>
              <ComplianceBadge variant="requires-approval" />
            </div>
            <p className="text-sm text-slate-500">
              Use the guided wizard to draft a strategy framework for advisor review.
            </p>
          </CardHeader>
          <CardContent>
            <Link
              href="/strategy/wizard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Strategy Wizard <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Strategy content is a discussion framework only. Requires advisor review and approval before implementation.
      </p>
    </div>
  );
}
