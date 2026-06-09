"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
  prompts: string[];
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Objectives",
    description: "Clarify what the family's capital is for.",
    prompts: [
      "What does success look like over the next generation?",
      "How is lifestyle, philanthropic, and growth capital separated?",
      "What outcomes would the family most want to avoid?",
    ],
  },
  {
    id: 2,
    title: "Time horizon",
    description: "Match capital to when it is expected to be needed.",
    prompts: [
      "What spending and obligations fall in the next 0–2 years?",
      "Which capital can be committed for 7+ years?",
      "How is legacy capital defined for the trust?",
    ],
  },
  {
    id: 3,
    title: "Liquidity policy",
    description: "Size the reserve that prevents forced selling.",
    prompts: [
      "What dedicated reserve floor is the family comfortable holding?",
      "Should unfunded commitments be pre-funded?",
      "How should distributions flex in a drawdown?",
    ],
  },
  {
    id: 4,
    title: "Risk calibration",
    description: "Separate risk capacity from risk willingness.",
    prompts: [
      "How much illiquidity is acceptable as a share of AUM?",
      "What concentration in a single operating business is tolerable?",
      "How should the family decide during market stress?",
    ],
  },
  {
    id: 5,
    title: "Governance & review",
    description: "Document how decisions get made and reviewed.",
    prompts: [
      "Who sits on the Investment Committee and what are the voting rules?",
      "What is the standing review cadence?",
      "How are decisions recorded and revisited?",
    ],
  },
];

export function StrategyWizard() {
  const [step, setStep] = useState(1);
  const current = STEPS[step - 1];

  return (
    <div>
      <PageHeader
        eyebrow="Discovery Workspace"
        title="Strategy discovery"
        lede="A guided, structured conversation. Notes captured here are drafted for advisor review and do not constitute investment advice or a commitment to invest."
        status={{ label: "Requires Advisor Approval", tone: "critical" }}
      />

      {/* Stepper */}
      <ol className="mb-8 flex flex-wrap gap-x-2 gap-y-3">
        {STEPS.map((s, i) => {
          const isDone = s.id < step;
          const isCurrent = s.id === step;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.id)}
                className="group flex items-center gap-2.5 text-left"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-medium transition-colors",
                    isCurrent && "bg-ink text-white",
                    isDone && "bg-brand/15 text-brand",
                    !isCurrent && !isDone && "bg-secondary text-ink-muted",
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                </span>
                <span
                  className={cn(
                    "text-[12.5px] font-medium",
                    isCurrent ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {s.title}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="h-px w-6 bg-hairline" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <p className="eyebrow">{`Step ${step} of ${STEPS.length}`}</p>
          <h2 className="mt-2 font-serif text-[22px] font-medium text-ink">
            {current.title}
          </h2>
          <p className="mt-1 text-[14px] text-ink-muted">{current.description}</p>

          <div className="mt-6 space-y-2.5">
            <p className="eyebrow">Guiding questions</p>
            <ul className="space-y-2">
              {current.prompts.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <label className="eyebrow mb-2 block">
              Discussion notes for advisor review
            </label>
            <textarea
              className="h-36 w-full resize-none rounded-lg border border-hairline bg-card px-3.5 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand/50 focus:ring-2 focus:ring-brand/15"
              placeholder={`Capture the family's input on ${current.title.toLowerCase()}…`}
            />
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => setStep(Math.min(STEPS.length, step + 1))}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              {step === STEPS.length ? "Submit draft for review" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <div>
                <p className="text-[13px] font-medium text-ink">
                  A discussion framework, not advice
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                  Everything captured here is drafted for your advisor and the
                  Investment Committee. Nothing is implemented automatically and
                  nothing here is a recommendation to buy or sell.
                </p>
              </div>
            </div>
          </Panel>
          <Panel>
            <p className="eyebrow mb-3">Discovery feeds</p>
            <ul className="space-y-2 text-[13px]">
              <li className="flex items-center justify-between">
                <span className="text-ink-muted">Strategy summary</span>
                <Link href="/strategy" className="font-medium text-brand">
                  View
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-muted">Policy statement</span>
                <Link href="/ips" className="font-medium text-brand">
                  View
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-muted">Liquidity policy</span>
                <Link href="/liquidity" className="font-medium text-brand">
                  View
                </Link>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
