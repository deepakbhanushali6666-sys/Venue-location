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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_bootstrap_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_label: string
          entity_type: string
          from_value: string
          id: string
          to_value: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string
          entity_type: string
          from_value?: string
          id?: string
          to_value?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string
          entity_type?: string
          from_value?: string
          id?: string
          to_value?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string
          created_at: string
          customer_name: string
          email: string
          event_date: string | null
          guest_count: number | null
          id: string
          lead_code: string
          message: string
          mobile: string
          purpose: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          venue_id: string | null
          venue_name: string
        }
        Insert: {
          budget?: string
          created_at?: string
          customer_name: string
          email: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          lead_code?: string
          message?: string
          mobile: string
          purpose?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          venue_id?: string | null
          venue_name?: string
        }
        Update: {
          budget?: string
          created_at?: string
          customer_name?: string
          email?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          lead_code?: string
          message?: string
          mobile?: string
          purpose?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          venue_id?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          admin_note: string
          amount: number
          created_at: string
          id: string
          invoice_number: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string
          owner_id: string
          payer_name: string
          reference: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_note?: string
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string
          owner_id: string
          payer_name?: string
          reference?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_note?: string
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string
          owner_id?: string
          payer_name?: string
          reference?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          mobile: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          mobile?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          mobile?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_on: string | null
          id: string
          invoice_number: string
          owner_id: string
          plan_name: string
          started_on: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_on?: string | null
          id?: string
          invoice_number?: string
          owner_id: string
          plan_name?: string
          started_on?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_on?: string | null
          id?: string
          invoice_number?: string
          owner_id?: string
          plan_name?: string
          started_on?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
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
      venue_reviews: {
        Row: {
          admin_note: string
          comment: string
          created_at: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          owner_reply: string
          owner_reply_at: string | null
          owner_reply_by: string | null
          rating: number
          reviewer_id: string
          reviewer_name: string
          status: Database["public"]["Enums"]["review_status"]
          title: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          admin_note?: string
          comment?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          owner_reply?: string
          owner_reply_at?: string | null
          owner_reply_by?: string | null
          rating: number
          reviewer_id: string
          reviewer_name?: string
          status?: Database["public"]["Enums"]["review_status"]
          title?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          admin_note?: string
          comment?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          owner_reply?: string
          owner_reply_at?: string | null
          owner_reply_by?: string | null
          rating?: number
          reviewer_id?: string
          reviewer_name?: string
          status?: Database["public"]["Enums"]["review_status"]
          title?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_reviews_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          amenities: string[]
          area: string
          capacity: number
          category: string
          city: string
          created_at: string
          description: string
          featured: boolean
          gst_number: string
          id: string
          map_query: string
          name: string
          owner_id: string
          parking: string
          photos: string[]
          slug: string
          starting_price: number
          state: string
          status: Database["public"]["Enums"]["venue_status"]
          suitable_for: string[]
          updated_at: string
          video_url: string
        }
        Insert: {
          address?: string
          amenities?: string[]
          area?: string
          capacity?: number
          category: string
          city: string
          created_at?: string
          description?: string
          featured?: boolean
          gst_number?: string
          id?: string
          map_query?: string
          name: string
          owner_id: string
          parking?: string
          photos?: string[]
          slug: string
          starting_price?: number
          state?: string
          status?: Database["public"]["Enums"]["venue_status"]
          suitable_for?: string[]
          updated_at?: string
          video_url?: string
        }
        Update: {
          address?: string
          amenities?: string[]
          area?: string
          capacity?: number
          category?: string
          city?: string
          created_at?: string
          description?: string
          featured?: boolean
          gst_number?: string
          id?: string
          map_query?: string
          name?: string
          owner_id?: string
          parking?: string
          photos?: string[]
          slug?: string
          starting_price?: number
          state?: string
          status?: Database["public"]["Enums"]["venue_status"]
          suitable_for?: string[]
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_payment: {
        Args: { p_payment_id: string; p_reason?: string }
        Returns: undefined
      }
      submit_lead: {
        Args: {
          p_budget?: string
          p_customer_name: string
          p_email: string
          p_event_date?: string
          p_guest_count?: number
          p_message?: string
          p_mobile: string
          p_purpose?: string
          p_venue_id?: string
          p_venue_name?: string
        }
        Returns: string
      }
      verify_payment: { Args: { p_payment_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "owner"
      lead_status:
        | "New"
        | "Contacted"
        | "Negotiation"
        | "Site Visit"
        | "Booked"
        | "Closed"
      payment_method: "upi" | "bank" | "cash" | "online"
      payment_status: "pending" | "verified" | "rejected"
      review_status: "pending" | "approved" | "rejected"
      subscription_status: "inactive" | "active" | "expired" | "cancelled"
      venue_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "owner"],
      lead_status: [
        "New",
        "Contacted",
        "Negotiation",
        "Site Visit",
        "Booked",
        "Closed",
      ],
      payment_method: ["upi", "bank", "cash", "online"],
      payment_status: ["pending", "verified", "rejected"],
      review_status: ["pending", "approved", "rejected"],
      subscription_status: ["inactive", "active", "expired", "cancelled"],
      venue_status: ["pending", "approved", "rejected"],
    },
  },
} as const
