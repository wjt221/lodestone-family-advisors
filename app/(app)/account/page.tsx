import Link from "next/link";
import { Info, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { getCurrentProfile, canManageUsers, getManagedUsers } from "@/lib/data/users";
import { getAllAccessibleClients } from "@/lib/data/clients";
import { ProfileForm } from "./profile-form";
import { UserManagement } from "./user-management";

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  const isAdmin = await canManageUsers();
  const [users, clients] = isAdmin
    ? await Promise.all([getManagedUsers(), getAllAccessibleClients()])
    : [[], []];

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Your account"
        lede="Manage your name and sign-in details. Administrators can also invite teammates and control who sees which family office."
      />

      {!profile.configured ? (
        <Panel className="bg-secondary/30">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div className="space-y-2 text-[13px] leading-relaxed text-ink-muted">
              <p className="text-[14px] font-medium text-ink">Account management is available in secure mode</p>
              <p>
                The portal is running in demo mode against illustrative data, so there is no
                signed-in account to edit. Connect Supabase to enable authentication, profile
                editing, and user management.
              </p>
            </div>
          </div>
        </Panel>
      ) : (
        <>
          <SectionHeading eyebrow="Profile" title="Your details" />
          <div className="mb-10">
            <ProfileForm initialName={profile.fullName ?? ""} email={profile.email ?? ""} />
          </div>

          {isAdmin && (
            <section className="mb-10">
              <SectionHeading
                eyebrow="Administration"
                title="People & access"
                description="Everyone who can sign in to the portal."
              />
              <UserManagement users={users} clients={clients} />
            </section>
          )}

          <Panel className="bg-secondary/30">
            <Link href="/settings" className="flex items-center gap-3 text-[13px] text-ink-muted transition-colors hover:text-ink">
              <Building2 className="h-4 w-4 shrink-0 text-brand" />
              <span>
                <span className="font-medium text-ink">Relationship &amp; firm details</span>
                {" "}— entities, advisory team, and disclosures live on the Settings page.
              </span>
            </Link>
          </Panel>
        </>
      )}
    </div>
  );
}
