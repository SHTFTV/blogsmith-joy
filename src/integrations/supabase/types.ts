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
      domain_repush_audit: {
        Row: {
          after_summary: Json
          before_summary: Json
          bundle_commit: string
          bundle_commit_short: string
          id: string
          notes: string | null
          run_at: string
          targets: Json
          targets_recovered: number
          targets_still_stale: number
          targets_total: number
          triggered_by: string | null
        }
        Insert: {
          after_summary: Json
          before_summary: Json
          bundle_commit: string
          bundle_commit_short: string
          id?: string
          notes?: string | null
          run_at?: string
          targets: Json
          targets_recovered?: number
          targets_still_stale?: number
          targets_total: number
          triggered_by?: string | null
        }
        Update: {
          after_summary?: Json
          before_summary?: Json
          bundle_commit?: string
          bundle_commit_short?: string
          id?: string
          notes?: string | null
          run_at?: string
          targets?: Json
          targets_recovered?: number
          targets_still_stale?: number
          targets_total?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      eyespyr_submissions: {
        Row: {
          category: string | null
          city: string | null
          id: string
          notes: string | null
          photos: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          category?: string | null
          city?: string | null
          id?: string
          notes?: string | null
          photos?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          category?: string | null
          city?: string | null
          id?: string
          notes?: string | null
          photos?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyespyr_submissions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_upload_alert_config: {
        Row: {
          burst_threshold: number
          burst_window_minutes: number
          id: number
          notify_webhook_url: string | null
          reject_threshold: number
          reject_window_minutes: number
          spray_threshold: number
          spray_window_minutes: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          burst_threshold?: number
          burst_window_minutes?: number
          id?: number
          notify_webhook_url?: string | null
          reject_threshold?: number
          reject_window_minutes?: number
          spray_threshold?: number
          spray_window_minutes?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          burst_threshold?: number
          burst_window_minutes?: number
          id?: number
          notify_webhook_url?: string | null
          reject_threshold?: number
          reject_window_minutes?: number
          spray_threshold?: number
          spray_window_minutes?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      guest_upload_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json
          event_count: number
          event_id: string | null
          id: string
          uploader_ip_hash: string
          window_end: string
          window_start: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          details?: Json
          event_count?: number
          event_id?: string | null
          id?: string
          uploader_ip_hash: string
          window_end: string
          window_start: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json
          event_count?: number
          event_id?: string | null
          id?: string
          uploader_ip_hash?: string
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_upload_alerts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "wedding_events"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_uploads: {
        Row: {
          auto_approved: boolean
          event_id: string
          id: string
          media_type: string
          photo_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string | null
          submitted_at: string
          uploader_ip_hash: string | null
          uploader_name: string | null
        }
        Insert: {
          auto_approved?: boolean
          event_id: string
          id?: string
          media_type?: string
          photo_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string | null
          submitted_at?: string
          uploader_ip_hash?: string | null
          uploader_name?: string | null
        }
        Update: {
          auto_approved?: boolean
          event_id?: string
          id?: string
          media_type?: string
          photo_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string | null
          submitted_at?: string
          uploader_ip_hash?: string | null
          uploader_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_uploads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "wedding_events"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_broadcasts: {
        Row: {
          created_at: string
          enqueued: number
          failed: number
          id: string
          notes: string | null
          skipped: number
          source: string
          template_name: string
          total_recipients: number
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          enqueued?: number
          failed?: number
          id?: string
          notes?: string | null
          skipped?: number
          source: string
          template_name: string
          total_recipients?: number
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          enqueued?: number
          failed?: number
          id?: string
          notes?: string | null
          skipped?: number
          source?: string
          template_name?: string
          total_recipients?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      launch_notify_subscribers: {
        Row: {
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed: boolean
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          source: string
          unsubscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          source?: string
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          source?: string
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      propagation_check_runs: {
        Row: {
          alert_error: string | null
          alert_sent: boolean
          bundle_commit: string
          bundle_commit_short: string
          error_count: number
          id: string
          match_count: number
          origins_checked: number
          results: Json
          run_at: string
          stale_count: number
        }
        Insert: {
          alert_error?: string | null
          alert_sent?: boolean
          bundle_commit: string
          bundle_commit_short: string
          error_count: number
          id?: string
          match_count: number
          origins_checked: number
          results: Json
          run_at?: string
          stale_count: number
        }
        Update: {
          alert_error?: string | null
          alert_sent?: boolean
          bundle_commit?: string
          bundle_commit_short?: string
          error_count?: number
          id?: string
          match_count?: number
          origins_checked?: number
          results?: Json
          run_at?: string
          stale_count?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      territories: {
        Row: {
          city: string
          country: string | null
          created_at: string
          latitude: number
          longitude: number
          max_slots: number | null
          population: number | null
          price_per_slot: number | null
          updated_at: string
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string
          latitude: number
          longitude: number
          max_slots?: number | null
          population?: number | null
          price_per_slot?: number | null
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string
          latitude?: number
          longitude?: number
          max_slots?: number | null
          population?: number | null
          price_per_slot?: number | null
          updated_at?: string
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
      vendors: {
        Row: {
          business_name: string
          category: string | null
          city: string | null
          created_at: string
          culture: string | null
          id: string
          instagram: string | null
          owner_name: string | null
          photo_url: string | null
          referral_count: number
          slug: string
          specialty: string | null
          talc_posts: number
          updated_at: string
          user_id: string | null
          verified: boolean
          website: string | null
        }
        Insert: {
          business_name: string
          category?: string | null
          city?: string | null
          created_at?: string
          culture?: string | null
          id?: string
          instagram?: string | null
          owner_name?: string | null
          photo_url?: string | null
          referral_count?: number
          slug: string
          specialty?: string | null
          talc_posts?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          website?: string | null
        }
        Update: {
          business_name?: string
          category?: string | null
          city?: string | null
          created_at?: string
          culture?: string | null
          id?: string
          instagram?: string | null
          owner_name?: string | null
          photo_url?: string | null
          referral_count?: number
          slug?: string
          specialty?: string | null
          talc_posts?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      wedding_event_secrets: {
        Row: {
          created_at: string
          event_id: string
          trusted_code: string
        }
        Insert: {
          created_at?: string
          event_id: string
          trusted_code: string
        }
        Update: {
          created_at?: string
          event_id?: string
          trusted_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_event_secrets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "wedding_events"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_events: {
        Row: {
          active: boolean
          couple_name: string
          created_at: string
          event_code: string
          id: string
          owner_id: string
        }
        Insert: {
          active?: boolean
          couple_name: string
          created_at?: string
          event_code: string
          id?: string
          owner_id: string
        }
        Update: {
          active?: boolean
          couple_name?: string
          created_at?: string
          event_code?: string
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_slot_count: { Args: { population: number }; Returns: number }
      calculate_slot_price: { Args: { population: number }; Returns: number }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_event_by_code: {
        Args: { code: string }
        Returns: {
          active: boolean
          couple_name: string
          event_code: string
          id: string
        }[]
      }
      get_event_by_trusted_code: {
        Args: { code: string }
        Returns: {
          active: boolean
          couple_name: string
          id: string
        }[]
      }
      get_my_event_trusted_code: {
        Args: { p_event_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      launch_notify_confirm: { Args: { p_token: string }; Returns: Json }
      launch_notify_subscribe: {
        Args: {
          p_email: string
          p_ip_hash?: string
          p_source?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      launch_notify_unsubscribe_by_email: {
        Args: { p_email: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      scan_guest_upload_anomalies: { Args: never; Returns: number }
      submit_guest_upload: {
        Args: {
          p_event_id: string
          p_media_type: string
          p_photo_url: string
          p_storage_path: string
          p_trusted_code?: string
          p_uploader_ip_hash: string
          p_uploader_name: string
        }
        Returns: string
      }
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
