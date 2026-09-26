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
      ai_audit_events: {
        Row: {
          action: string | null
          agent_type: string | null
          conversation_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          risk_level: string | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          action?: string | null
          agent_type?: string | null
          conversation_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          risk_level?: string | null
          success?: boolean
          user_id?: string | null
        }
        Update: {
          action?: string | null
          agent_type?: string | null
          conversation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          risk_level?: string | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_events: {
        Row: {
          agent_type: string | null
          conversation_id: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          input_tokens: number | null
          model: string | null
          output_tokens: number | null
          user_id: string | null
        }
        Insert: {
          agent_type?: string | null
          conversation_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          agent_type?: string | null
          conversation_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      aom_analyses: {
        Row: {
          analysis: string
          created_at: string
          created_by: string | null
          department: string
          id: string
          item_id: string
          item_title: string
          item_type: string
          model: string
        }
        Insert: {
          analysis: string
          created_at?: string
          created_by?: string | null
          department: string
          id?: string
          item_id: string
          item_title?: string
          item_type: string
          model?: string
        }
        Update: {
          analysis?: string
          created_at?: string
          created_by?: string | null
          department?: string
          id?: string
          item_id?: string
          item_title?: string
          item_type?: string
          model?: string
        }
        Relationships: []
      }
      aom_problems: {
        Row: {
          category: string
          country: string
          created_at: string
          evidence: string
          id: string
          opportunity_score: number
          region: string
          severity: number
          source_url: string | null
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          country: string
          created_at?: string
          evidence?: string
          id?: string
          opportunity_score?: number
          region?: string
          severity?: number
          source_url?: string | null
          status?: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          country?: string
          created_at?: string
          evidence?: string
          id?: string
          opportunity_score?: number
          region?: string
          severity?: number
          source_url?: string | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      aom_research: {
        Row: {
          abstract: string
          category: string
          country: string
          created_at: string
          id: string
          source: string
          source_url: string | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          abstract: string
          category: string
          country?: string
          created_at?: string
          id?: string
          source?: string
          source_url?: string | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          abstract?: string
          category?: string
          country?: string
          created_at?: string
          id?: string
          source?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      aom_submissions: {
        Row: {
          ai_summary: string | null
          category: string
          contact_email: string | null
          country: string
          created_at: string
          evidence_url: string | null
          id: string
          status: string
          summary: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          category: string
          contact_email?: string | null
          country: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          status?: string
          summary: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          category?: string
          contact_email?: string | null
          country?: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expected_annual_return: number
          id: string
          kind: string
          name: string
          notes: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expected_annual_return?: number
          id?: string
          kind?: string
          name: string
          notes?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expected_annual_return?: number
          id?: string
          kind?: string
          name?: string
          notes?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mcp_access: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          note: string | null
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          note?: string | null
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          note?: string | null
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          client_message_id: string | null
          conversation_id: string
          created_at: string
          department: string | null
          id: string
          parts: Json
          role: string
          user_id: string
        }
        Insert: {
          client_message_id?: string | null
          conversation_id: string
          created_at?: string
          department?: string | null
          id?: string
          parts?: Json
          role: string
          user_id: string
        }
        Update: {
          client_message_id?: string | null
          conversation_id?: string
          created_at?: string
          department?: string | null
          id?: string
          parts?: Json
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          files_per_day: number
          messages_per_day: number
          name: string
          price_cents: number
          provider_price_id: string | null
          searches_per_day: number
          slug: string
          sort_order: number
          updated_at: string
          voice_minutes_per_day: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          files_per_day?: number
          messages_per_day?: number
          name: string
          price_cents?: number
          provider_price_id?: string | null
          searches_per_day?: number
          slug: string
          sort_order?: number
          updated_at?: string
          voice_minutes_per_day?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          files_per_day?: number
          messages_per_day?: number
          name?: string
          price_cents?: number
          provider_price_id?: string | null
          searches_per_day?: number
          slug?: string
          sort_order?: number
          updated_at?: string
          voice_minutes_per_day?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string
          created_at: string
          display_name: string | null
          id: string
          language: string
          tone: string
          ui_language: string
          updated_at: string
          voice_rate: number
          voice_uri: string
        }
        Insert: {
          country?: string
          created_at?: string
          display_name?: string | null
          id: string
          language?: string
          tone?: string
          ui_language?: string
          updated_at?: string
          voice_rate?: number
          voice_uri?: string
        }
        Update: {
          country?: string
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string
          tone?: string
          ui_language?: string
          updated_at?: string
          voice_rate?: number
          voice_uri?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string
          token: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan_slug: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_slug: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_slug?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_slug_fkey"
            columns: ["plan_slug"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["slug"]
          },
        ]
      }
      ui_translations: {
        Row: {
          created_at: string
          id: string
          key: string
          locale: string
          machine: boolean
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          locale: string
          machine?: boolean
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          locale?: string
          machine?: boolean
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          day: string
          id: string
          kind: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day?: string
          id?: string
          kind: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          kind?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          created_at: string
          device_name: string | null
          id: string
          last_seen_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          id?: string
          last_seen_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          id?: string
          last_seen_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          category: string
          content: string
          conversation_id: string | null
          created_at: string
          enabled: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          conversation_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_quota: {
        Args: { _kind: string; _quantity?: number; _user_id: string }
        Returns: Json
      }
      current_plan: {
        Args: { _user_id: string }
        Returns: {
          active: boolean
          created_at: string
          currency: string
          files_per_day: number
          messages_per_day: number
          name: string
          price_cents: number
          provider_price_id: string | null
          searches_per_day: number
          slug: string
          sort_order: number
          updated_at: string
          voice_minutes_per_day: number
        }
        SetofOptions: {
          from: "*"
          to: "plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_entitlements: { Args: { _user_id: string }; Returns: Json }
      has_mcp_access: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
