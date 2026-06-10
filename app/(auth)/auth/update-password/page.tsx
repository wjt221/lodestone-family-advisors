"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, CheckCircle } from "lucide-react";
import { Panel } from "@/components/panel";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 2500);
    } catch {
      setError("Unable to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo-dark.png"
            alt="Lodestone Family Advisors"
            width={200}
            height={90}
            className="w-44"
            priority
          />
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Investment OS
          </p>
        </div>

        <Panel className="p-7">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-positive-soft">
                <CheckCircle className="h-5 w-5 text-positive" />
              </div>
              <h1 className="font-serif text-[18px] font-medium text-ink">
                Password updated
              </h1>
              <p className="mt-2 text-[13px] text-ink-muted">
                Redirecting you to the dashboard…
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand" />
                <h1 className="font-serif text-[18px] font-medium text-ink">
                  Set new password
                </h1>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="eyebrow mb-1.5 block" htmlFor="password">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/15"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-1.5 block" htmlFor="confirm">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
