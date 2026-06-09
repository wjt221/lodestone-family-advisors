"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Info, Lock } from "lucide-react";
import { Panel } from "@/components/panel";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      const redirectTo = params.get("redirectedFrom") || "/dashboard";
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
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

        {configured ? (
          <Panel className="p-7">
            <div className="mb-5 flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand" />
              <h1 className="font-serif text-[18px] font-medium text-ink">
                Sign in
              </h1>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/15"
                />
              </div>
              <div>
                <label className="eyebrow mb-1.5 block" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className="mt-5 border-t border-hairline pt-4 text-[11px] leading-relaxed text-ink-muted">
              Access is restricted to authorized family members and advisors. All
              activity is subject to review.
            </p>
          </Panel>
        ) : (
          <Panel className="p-7">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <div>
                <h1 className="font-serif text-[18px] font-medium text-ink">
                  Demo mode
                </h1>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  Supabase is not configured, so the portal is running against
                  illustrative mock data and no sign-in is required.
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
                  To enable secure authentication, set the Supabase environment
                  variables (see <code className="text-ink">.env.example</code>).
                </p>
                <Link
                  href="/dashboard"
                  className="mt-4 inline-block rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Continue to demo
                </Link>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
