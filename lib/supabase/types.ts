// Generated from the live Supabase schema (project ezhgeexsgwhlhqkevskz) via
// `supabase gen types` / the Supabase MCP. Regenerate after schema changes.
//
// Compatibility aliases (MeetingRow, HoldingRow, …) are defined at the bottom so
// existing data-layer imports keep working.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          assigned_to: string | null
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          meeting_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_client_assignments: {
        Row: {
          advisor_id: string
          client_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          advisor_id: string
          client_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          client_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_client_assignments_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_notes: {
        Row: {
          author: string | null
          body: string
          client_id: string
          client_visible: boolean
          created_at: string
          id: string
          related_id: string | null
          related_type: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          body: string
          client_id: string
          client_visible?: boolean
          created_at?: string
          id?: string
          related_id?: string | null
          related_type?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string
          client_id?: string
          client_visible?: boolean
          created_at?: string
          id?: string
          related_id?: string | null
          related_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_allocations: {
        Row: {
          asset_class: string
          client_id: string
          created_at: string
          id: string
          max_pct: number
          min_pct: number
          target_pct: number
          updated_at: string
        }
        Insert: {
          asset_class: string
          client_id: string
          created_at?: string
          id?: string
          max_pct?: number
          min_pct?: number
          target_pct?: number
          updated_at?: string
        }
        Update: {
          asset_class?: string
          client_id?: string
          created_at?: string
          id?: string
          max_pct?: number
          min_pct?: number
          target_pct?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_allocations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          client_id: string | null
          created_at: string
          detail: Json
          id: string
          row_id: string | null
          table_name: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          client_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          row_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          client_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          row_id?: string | null
          table_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          as_of: string | null
          created_at: string
          id: string
          name: string
          relationship_since: string | null
          reporting_currency: string
          short_name: string | null
          updated_at: string
        }
        Insert: {
          as_of?: string | null
          created_at?: string
          id?: string
          name: string
          relationship_since?: string | null
          reporting_currency?: string
          short_name?: string | null
          updated_at?: string
        }
        Update: {
          as_of?: string | null
          created_at?: string
          id?: string
          name?: string
          relationship_since?: string | null
          reporting_currency?: string
          short_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      diligence_items: {
        Row: {
          alignment: string | null
          asset_class: string | null
          client_id: string
          created_at: string
          decision_status: string | null
          fees: string | null
          id: string
          liquidity_terms: string | null
          merits: Json
          name: string
          open_questions: Json
          risks: Json
          sponsor: string | null
          stage: string
          target_commitment: number | null
          tax_considerations: string | null
          updated_at: string
        }
        Insert: {
          alignment?: string | null
          asset_class?: string | null
          client_id: string
          created_at?: string
          decision_status?: string | null
          fees?: string | null
          id?: string
          liquidity_terms?: string | null
          merits?: Json
          name: string
          open_questions?: Json
          risks?: Json
          sponsor?: string | null
          stage?: string
          target_commitment?: number | null
          tax_considerations?: string | null
          updated_at?: string
        }
        Update: {
          alignment?: string | null
          asset_class?: string | null
          client_id?: string
          created_at?: string
          decision_status?: string | null
          fees?: string | null
          id?: string
          liquidity_terms?: string | null
          merits?: Json
          name?: string
          open_questions?: Json
          risks?: Json
          sponsor?: string | null
          stage?: string
          target_commitment?: number | null
          tax_considerations?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diligence_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          client_id: string
          created_at: string
          id: string
          name: string
          owner: string | null
          status: string
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_id: string
          created_at?: string
          id?: string
          name: string
          owner?: string | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          owner?: string | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          client_id: string
          created_at: string
          id: string
          name: string
          purpose: string | null
          type: string | null
          updated_at: string
          value: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          name: string
          purpose?: string | null
          type?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          purpose?: string | null
          type?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "entities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          account: string | null
          allocation_pct: number
          asset_class: string
          carry_pct: number | null
          client_id: string
          commitment: number | null
          contributions: number | null
          created_at: string
          distributions: number | null
          entity_id: string | null
          id: string
          liquidity: string
          manager: string | null
          market: string
          mgmt_fee_pct: number
          name: string
          note: string | null
          status: string
          strategy: string | null
          structure: string | null
          unfunded: number | null
          updated_at: string
          value: number
          vintage: string | null
        }
        Insert: {
          account?: string | null
          allocation_pct?: number
          asset_class: string
          carry_pct?: number | null
          client_id: string
          commitment?: number | null
          contributions?: number | null
          created_at?: string
          distributions?: number | null
          entity_id?: string | null
          id?: string
          liquidity?: string
          manager?: string | null
          market?: string
          mgmt_fee_pct?: number
          name: string
          note?: string | null
          status?: string
          strategy?: string | null
          structure?: string | null
          unfunded?: number | null
          updated_at?: string
          value?: number
          vintage?: string | null
        }
        Update: {
          account?: string | null
          allocation_pct?: number
          asset_class?: string
          carry_pct?: number | null
          client_id?: string
          commitment?: number | null
          contributions?: number | null
          created_at?: string
          distributions?: number | null
          entity_id?: string | null
          id?: string
          liquidity?: string
          manager?: string | null
          market?: string
          mgmt_fee_pct?: number
          name?: string
          note?: string | null
          status?: string
          strategy?: string | null
          structure?: string | null
          unfunded?: number | null
          updated_at?: string
          value?: number
          vintage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      ips_documents: {
        Row: {
          client_id: string
          created_at: string
          id: string
          next_review: string | null
          prepared_by: string | null
          review_cadence: string | null
          status: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          next_review?: string | null
          prepared_by?: string | null
          review_cadence?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          next_review?: string | null
          prepared_by?: string | null
          review_cadence?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ips_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ips_versions: {
        Row: {
          client_id: string
          content: Json
          created_at: string
          created_by: string | null
          id: string
          ips_document_id: string
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          client_id: string
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          ips_document_id: string
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          client_id?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          ips_document_id?: string
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ips_versions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ips_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ips_versions_ips_document_id_fkey"
            columns: ["ips_document_id"]
            isOneToOne: false
            referencedRelation: "ips_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_needs: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          label: string
          m12: number
          m24: number
          m36: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          label: string
          m12?: number
          m24?: number
          m36?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          m12?: number
          m24?: number
          m36?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "liquidity_needs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          author: string | null
          body: string
          client_id: string
          client_visible: boolean
          created_at: string
          id: string
          meeting_id: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body: string
          client_id: string
          client_visible?: boolean
          created_at?: string
          id?: string
          meeting_id: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string
          client_id?: string
          client_visible?: boolean
          created_at?: string
          id?: string
          meeting_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: Json
          attendees: Json
          client_id: string
          created_at: string
          id: string
          meeting_date: string | null
          meeting_time: string | null
          status: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          agenda?: Json
          attendees?: Json
          client_id: string
          created_at?: string
          id?: string
          meeting_date?: string | null
          meeting_time?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          agenda?: Json
          attendees?: Json
          client_id?: string
          created_at?: string
          id?: string
          meeting_date?: string | null
          meeting_time?: string | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_summaries: {
        Row: {
          actual_pct: number | null
          amount: number | null
          as_of: string | null
          benchmark_return: number | null
          client_id: string
          created_at: string
          excess_return: number | null
          expected_return: number | null
          id: string
          label: string
          return_net: number | null
          scope: string
          sort_order: number
          target_pct: number | null
          updated_at: string
        }
        Insert: {
          actual_pct?: number | null
          amount?: number | null
          as_of?: string | null
          benchmark_return?: number | null
          client_id: string
          created_at?: string
          excess_return?: number | null
          expected_return?: number | null
          id?: string
          label: string
          return_net?: number | null
          scope: string
          sort_order?: number
          target_pct?: number | null
          updated_at?: string
        }
        Update: {
          actual_pct?: number | null
          amount?: number | null
          as_of?: string | null
          benchmark_return?: number | null
          client_id?: string
          created_at?: string
          excess_return?: number | null
          expected_return?: number | null
          id?: string
          label?: string
          return_net?: number | null
          scope?: string
          sort_order?: number
          target_pct?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      risk_profiles: {
        Row: {
          client_id: string
          created_at: string
          exposure: string | null
          factor: string
          id: string
          observation: string | null
          owner: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          exposure?: string | null
          factor: string
          id?: string
          observation?: string | null
          owner?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          exposure?: string | null
          factor?: string
          id?: string
          observation?: string | null
          owner?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write_client: { Args: { cid: string }; Returns: boolean }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_client_access: { Args: { cid: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      user_role: "client" | "advisor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["client", "advisor", "admin"],
    },
  },
} as const

// ── Compatibility aliases (used across lib/data/*) ──────────────────────────
export type UserRole = Enums<"user_role">
export type ClientRow = Tables<"clients">
export type EntityRow = Tables<"entities">
export type HoldingRow = Tables<"holdings">
export type MeetingRow = Tables<"meetings">
export type DocumentRow = Tables<"documents">
export type PerformanceSummaryRow = Tables<"performance_summaries">
