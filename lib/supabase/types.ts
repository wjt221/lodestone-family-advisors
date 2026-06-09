// ─────────────────────────────────────────────────────────────────────────────
// Hand-written Supabase database types.
//
// This is a placeholder that mirrors supabase/migrations/001_initial_schema.sql.
// Once a project is connected, regenerate the authoritative version with:
//
//   npx supabase gen types typescript --project-id <id> --schema public > lib/supabase/types.ts
//
// Only the columns the data-access layer reads are typed precisely; the rest are
// represented loosely. JSON columns use `unknown` to force explicit narrowing.
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "client" | "advisor" | "admin";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type ClientScoped = Timestamps & {
  id: string;
  client_id: string;
};

export interface ProfileRow extends Timestamps {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
}

export interface ClientRow extends Timestamps {
  id: string;
  name: string;
  short_name: string | null;
  relationship_since: string | null;
  reporting_currency: string;
  as_of: string | null;
}

export interface EntityRow extends ClientScoped {
  name: string;
  type: string | null;
  value: number;
  purpose: string | null;
}

export interface HoldingRow extends ClientScoped {
  entity_id: string | null;
  name: string;
  asset_class: string;
  market: string;
  liquidity: string;
  value: number;
  allocation_pct: number;
  manager: string | null;
  vintage: string | null;
  commitment: number | null;
  unfunded: number | null;
  mgmt_fee_pct: number;
  carry_pct: number | null;
  note: string | null;
}

export interface MeetingRow extends ClientScoped {
  title: string;
  meeting_date: string | null;
  meeting_time: string | null;
  type: string | null;
  attendees: unknown;
  status: string;
  agenda: unknown;
}

export interface DocumentRow extends ClientScoped {
  name: string;
  category: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  owner: string | null;
  status: string;
}

export interface ActionItemRow extends ClientScoped {
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  meeting_id: string | null;
}

export interface AdvisorNoteRow extends ClientScoped {
  body: string;
  author: string | null;
  client_visible: boolean;
  related_type: string | null;
  related_id: string | null;
}

type GenericTable<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: GenericTable<ProfileRow>;
      clients: GenericTable<ClientRow>;
      entities: GenericTable<EntityRow>;
      client_users: GenericTable<ClientScoped & { user_id: string }>;
      advisor_client_assignments: GenericTable<ClientScoped & { advisor_id: string }>;
      holdings: GenericTable<HoldingRow>;
      asset_allocations: GenericTable<
        ClientScoped & {
          asset_class: string;
          min_pct: number;
          target_pct: number;
          max_pct: number;
        }
      >;
      liquidity_needs: GenericTable<
        ClientScoped & {
          label: string;
          description: string | null;
          m12: number;
          m24: number;
          m36: number;
        }
      >;
      risk_profiles: GenericTable<
        ClientScoped & {
          factor: string;
          severity: string;
          status: string;
          exposure: string | null;
          observation: string | null;
          owner: string | null;
        }
      >;
      ips_documents: GenericTable<
        ClientScoped & {
          title: string;
          status: string;
          version: string;
          prepared_by: string | null;
          review_cadence: string | null;
          next_review: string | null;
        }
      >;
      ips_versions: GenericTable<
        ClientScoped & {
          ips_document_id: string;
          version: string;
          status: string;
          content: unknown;
          created_by: string | null;
        }
      >;
      diligence_items: GenericTable<
        ClientScoped & {
          name: string;
          sponsor: string | null;
          asset_class: string | null;
          stage: string;
          target_commitment: number | null;
          merits: unknown;
          risks: unknown;
          fees: string | null;
          liquidity_terms: string | null;
          alignment: string | null;
          tax_considerations: string | null;
          open_questions: unknown;
          decision_status: string | null;
        }
      >;
      meetings: GenericTable<MeetingRow>;
      meeting_notes: GenericTable<
        ClientScoped & {
          meeting_id: string;
          body: string;
          author: string | null;
          client_visible: boolean;
        }
      >;
      documents: GenericTable<DocumentRow>;
      action_items: GenericTable<ActionItemRow>;
      advisor_notes: GenericTable<AdvisorNoteRow>;
      audit_log: GenericTable<{
        id: string;
        client_id: string | null;
        actor_id: string | null;
        action: string;
        table_name: string | null;
        row_id: string | null;
        detail: unknown;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { user_role: UserRole };
    CompositeTypes: Record<string, never>;
  };
}
