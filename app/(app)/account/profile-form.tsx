"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, Lock, User as UserIcon } from "lucide-react";
import { Panel, PanelHeader } from "@/components/panel";
import { Field, inputClass, FormError } from "@/components/form-controls";
import { createClient } from "@/lib/supabase/client";
import { updateOwnName } from "@/lib/actions/account";
import { cn } from "@/lib/utils";

interface Props {
  initialName: string;
  email: string;
}

function SavedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-positive">
      <Check className="h-3.5 w-3.5" /> Saved
    </span>
  );
}

export function ProfileForm({ initialName, email }: Props) {
  const router = useRouter();

  // ── Name ──
  const [name, setName] = useState(initialName);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [savingName, startSaveName] = useTransition();

  function saveName() {
    setNameErr(null);
    setNameSaved(false);
    startSaveName(async () => {
      const res = await updateOwnName(name);
      if (!res.ok) { setNameErr(res.error ?? "Could not save."); return; }
      setNameSaved(true);
      router.refresh();
    });
  }

  // ── Email ──
  const [newEmail, setNewEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr(null); setEmailMsg(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail.trim())) {
      setEmailErr("Enter a valid email address."); return;
    }
    setSavingEmail(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) { setEmailErr(error.message); return; }
      setEmailMsg(`Confirmation sent to ${newEmail.trim()}. The change takes effect once you confirm from both addresses.`);
      setNewEmail("");
    } catch {
      setEmailErr("Could not update email. Please try again.");
    } finally {
      setSavingEmail(false);
    }
  }

  // ── Password ──
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(null); setPwSaved(false);
    if (pw.length < 8) { setPwErr("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setPwErr("Passwords do not match."); return; }
    setSavingPw(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) { setPwErr(error.message); return; }
      setPwSaved(true); setPw(""); setPw2("");
    } catch {
      setPwErr("Could not update password. Please try again.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Name */}
      <Panel>
        <PanelHeader
          title="Display name"
          description="Shown across the portal and in the sidebar."
          action={<UserIcon className="h-4 w-4 text-ink-muted" />}
        />
        <div className="space-y-3">
          <Field label="Full name">
            <input className={inputClass} value={name} onChange={(e) => { setName(e.target.value); setNameSaved(false); }} />
          </Field>
          {nameErr && <FormError message={nameErr} />}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveName}
              disabled={savingName || !name.trim() || name.trim() === initialName}
              className="rounded-md bg-ink px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {savingName ? "Saving…" : "Save name"}
            </button>
            {nameSaved && <SavedBadge />}
          </div>
        </div>
      </Panel>

      {/* Email */}
      <Panel>
        <PanelHeader
          title="Email"
          description="Used to sign in and for account notices."
          action={<Mail className="h-4 w-4 text-ink-muted" />}
        />
        <form onSubmit={saveEmail} className="space-y-3">
          <Field label="Current">
            <input className={cn(inputClass, "bg-secondary/50 text-ink-muted")} value={email} readOnly />
          </Field>
          <Field label="New email">
            <input className={inputClass} type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@example.com" />
          </Field>
          {emailErr && <FormError message={emailErr} />}
          {emailMsg && <p className="rounded-md border border-positive/25 bg-positive-soft px-3 py-2 text-[12px] leading-relaxed text-positive">{emailMsg}</p>}
          <button
            type="submit"
            disabled={savingEmail || !newEmail.trim()}
            className="rounded-md bg-ink px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {savingEmail ? "Sending…" : "Update email"}
          </button>
        </form>
      </Panel>

      {/* Password */}
      <Panel>
        <PanelHeader
          title="Password"
          description="Set a new sign-in password."
          action={<Lock className="h-4 w-4 text-ink-muted" />}
        />
        <form onSubmit={savePassword} className="space-y-3">
          <Field label="New password">
            <input className={inputClass} type="password" autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setPwSaved(false); }} />
          </Field>
          <Field label="Confirm password">
            <input className={inputClass} type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </Field>
          {pwErr && <FormError message={pwErr} />}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingPw || !pw || !pw2}
              className="rounded-md bg-ink px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {savingPw ? "Updating…" : "Update password"}
            </button>
            {pwSaved && <SavedBadge />}
          </div>
        </form>
      </Panel>
    </div>
  );
}
