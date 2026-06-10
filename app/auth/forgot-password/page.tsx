"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Panel } from "@/components/panel";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const base =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${base}/auth/update-password`,
      });
      if (error) {
        setError(error.message);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="font-serif text-[22px] font-medium tracking-tight text-ink">
              Lodestone
            </span>
            <span className="h-4 w-px bg-hairline" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand">
              Family Advisors
            </span>
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Investment OS
          </p>
        </div>

        <Panel className="p-7">
          {!configured ? (
            <div className="text-center">
              <p className="text-[13px] text-ink-muted">
                Password reset is only available in secure mode.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-brand hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          ) : submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-positive-soft">
                <Mail className="h-5 w-5 text-positive" />
              </div>
              <h1 className="font-serif text-[18px] font-medium text-ink">
                Check your email
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                If <span className="font-medium text-ink">{email}</span> has an
                account, you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-brand hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h1 className="font-serif text-[18px] font-medium text-ink">
                  Reset your password
                </h1>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="eyebrow mb-1.5 block" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/15"
                  />
                </div>
                {error && (
                  <p className="rounded-md border border-critical/25 bg-critical-soft px-3 py-2 text-[12.5px] text-critical">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <div className="mt-5 border-t border-hairline pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
