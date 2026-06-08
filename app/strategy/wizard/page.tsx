"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplianceBadge } from "@/components/compliance-badge";

const STEPS = [
  { id: 1, title: "Objectives", description: "Define primary investment objectives" },
  { id: 2, title: "Risk Profile", description: "Assess risk tolerance and constraints" },
  { id: 3, title: "Time Horizon", description: "Establish investment time horizons" },
  { id: 4, title: "Constraints", description: "Document restrictions and liquidity needs" },
  { id: 5, title: "Review & Submit", description: "Submit draft for advisor review" },
];

export default function StrategyWizardPage() {
  const [step, setStep] = useState(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Strategy Wizard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Draft a strategy framework for advisor review
          </p>
        </div>
        <ComplianceBadge variant="requires-approval" />
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                s.id === step
                  ? "bg-blue-600 text-white"
                  : s.id < step
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {s.id}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 ${
                  s.id < step ? "bg-blue-400" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="border-0 shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Step {step}: {STEPS[step - 1].title}
          </CardTitle>
          <p className="text-sm text-slate-500">{STEPS[step - 1].description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Discussion Point</p>
            <p>
              Content entered here is a discussion framework only. It will be
              submitted as a draft for your advisor&apos;s review and does not
              constitute investment advice or a commitment to invest.
            </p>
          </div>

          <textarea
            className="w-full h-32 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={`Enter ${STEPS[step - 1].title.toLowerCase()} notes for discussion...`}
          />

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setStep(Math.min(STEPS.length, step + 1))}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {step === STEPS.length ? "Submit Draft for Review" : "Next"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
