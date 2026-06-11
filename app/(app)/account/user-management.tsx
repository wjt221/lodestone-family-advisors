"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Pencil, Trash2, ShieldCheck, Mail } from "lucide-react";
import { Panel } from "@/components/panel";
import { StatusPill, type Tone } from "@/components/status-pill";
import { Field, inputClass, FormError } from "@/components/form-controls";
import { inviteUser, updateUser, removeUser } from "@/lib/actions/manage-users";
import type { ManagedUser } from "@/lib/data/users";
import type { ClientSummary } from "@/lib/data/clients";
import type { UserRole } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface Props {
  users: ManagedUser[];
  clients: ClientSummary[];
}

const ROLE_TONE: Record<UserRole, Tone> = {
  admin: "info",
  advisor: "caution",
  client: "neutral",
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  advisor: "Advisor",
  client: "Client",
};

interface DialogState {
  mode: "invite" | "edit";
  user?: ManagedUser;
}

function UserDialog({
  state, clients, onClose, onDone,
}: {
  state: DialogState;
  clients: ClientSummary[];
  onClose: () => void;
  onDone: () => void;
}) {
  const editing = state.mode === "edit";
  const u = state.user;
  const [email] = useState(u?.email ?? "");
  const [fullName, setFullName] = useState(u?.fullName ?? "");
  const [role, setRole] = useState<UserRole>(u?.role ?? "client");
  const [clientId, setClientId] = useState<string>(u?.clients[0]?.id ?? clients[0]?.id ?? "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      const res = editing && u
        ? await updateUser({ userId: u.id, fullName, role, clientId: role === "admin" ? null : clientId })
        : await inviteUser({ email: inviteEmail, fullName, role, clientId: role === "admin" ? null : clientId });
      if (!res.ok) { setError(res.error ?? "Something went wrong."); return; }
      onDone();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-16 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="font-serif text-[18px] font-medium text-ink">
            {editing ? "Edit user" : "Invite a user"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {!editing && (
            <Field label="Email" hint="An invitation with a secure sign-in link is sent here.">
              <input className={inputClass} type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@example.com" autoFocus />
            </Field>
          )}
          {editing && (
            <Field label="Email">
              <input className={cn(inputClass, "bg-secondary/50 text-ink-muted")} value={email} readOnly />
            </Field>
          )}
          <Field label="Full name">
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="client">Client — sees only their family office</option>
              <option value="advisor">Advisor — Lodestone staff for assigned offices</option>
              <option value="admin">Administrator — full access, all offices</option>
            </select>
          </Field>
          {role !== "admin" && (
            <Field label="Family office">
              <select className={inputClass} value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.length === 0 && <option value="">No family offices available</option>}
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          )}
          {error && <FormError message={error} />}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-hairline px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-md border border-hairline px-3.5 py-2 text-[13px] text-ink-muted hover:text-ink">Cancel</button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || (!editing && !inviteEmail.trim()) || (role !== "admin" && !clientId)}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {editing
              ? (pending ? "Saving…" : "Save changes")
              : (pending ? "Sending…" : <><Mail className="h-3.5 w-3.5" /> Send invitation</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserManagement({ users, clients }: Props) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removeErr, setRemoveErr] = useState<string | null>(null);
  const [removing, startRemove] = useTransition();

  function doRemove(id: string) {
    setRemoveErr(null);
    startRemove(async () => {
      const res = await removeUser(id);
      if (!res.ok) { setRemoveErr(res.error ?? "Could not remove user."); return; }
      setConfirmRemove(null);
      router.refresh();
    });
  }

  return (
    <Panel inset>
      <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-[17px] font-medium text-ink">
            <ShieldCheck className="h-4 w-4 text-brand" /> Team & access
          </h3>
          <p className="mt-1 text-[13px] text-ink-muted">
            Invite people, set their role, and choose which family office they can see.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ mode: "invite" })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" /> Invite user
        </button>
      </div>

      {removeErr && <div className="px-6 pb-3"><FormError message={removeErr} /></div>}

      <div className="overflow-x-auto border-t border-hairline">
        <table className="w-full min-w-[720px] text-[13px]">
          <thead>
            <tr className="border-b border-hairline bg-secondary/60">
              {["User", "Role", "Family office", ""].map((h, i) => (
                <th key={h || i} className={cn("px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted", i === 3 ? "text-right" : "text-left")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-ink-muted">No users yet.</td></tr>
            )}
            {users.map((u) => {
              const isConfirming = confirmRemove === u.id;
              return (
                <tr key={u.id} className={cn("transition-colors", isConfirming ? "bg-critical/5" : "hover:bg-secondary/40")}>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-ink">
                      {u.fullName || "—"}
                      {u.isSelf && <span className="ml-2 text-[11px] font-normal text-ink-muted">(you)</span>}
                    </p>
                    <p className="text-[12px] text-ink-muted">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill tone={ROLE_TONE[u.role]} dot={false}>{ROLE_LABEL[u.role]}</StatusPill>
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted">
                    {u.role === "admin"
                      ? "All offices"
                      : u.clients.length
                        ? u.clients.map((c) => c.name).join(", ")
                        : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    {isConfirming ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => doRemove(u.id)} disabled={removing} className="rounded-md bg-critical px-2.5 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-50">{removing ? "Removing…" : "Confirm remove"}</button>
                        <button type="button" onClick={() => setConfirmRemove(null)} className="rounded-md border border-hairline px-2.5 py-1 text-[11px] text-ink-muted hover:text-ink">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => setDialog({ mode: "edit", user: u })} className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-secondary hover:text-ink" aria-label="Edit user"><Pencil className="h-3.5 w-3.5" /></button>
                        {!u.isSelf && (
                          <button type="button" onClick={() => { setConfirmRemove(u.id); setRemoveErr(null); }} className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical" aria-label="Remove user"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dialog && (
        <UserDialog
          state={dialog}
          clients={clients}
          onClose={() => setDialog(null)}
          onDone={() => { setDialog(null); router.refresh(); }}
        />
      )}
    </Panel>
  );
}
