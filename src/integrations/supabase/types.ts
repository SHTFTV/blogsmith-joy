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
