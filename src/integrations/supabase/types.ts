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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string
          id: string
          language: string
          notes: string | null
          parsed_body: string | null
          quality_score: number | null
          raw_body: string | null
          raw_from: string | null
          raw_subject: string | null
          reviewer_id: string | null
          segment: string | null
          source: string
          status: Database["public"]["Enums"]["submission_status"]
          suggested_category: string | null
          suggested_tags: string[] | null
          template_type: Database["public"]["Enums"]["template_type"]
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          notes?: string | null
          parsed_body?: string | null
          quality_score?: number | null
          raw_body?: string | null
          raw_from?: string | null
          raw_subject?: string | null
          reviewer_id?: string | null
          segment?: string | null
          source?: string
          status?: Database["public"]["Enums"]["submission_status"]
          suggested_category?: string | null
          suggested_tags?: string[] | null
          template_type?: Database["public"]["Enums"]["template_type"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          notes?: string | null
          parsed_body?: string | null
          quality_score?: number | null
          raw_body?: string | null
          raw_from?: string | null
          raw_subject?: string | null
          reviewer_id?: string | null
          segment?: string | null
          source?: string
          status?: Database["public"]["Enums"]["submission_status"]
          suggested_category?: string | null
          suggested_tags?: string[] | null
          template_type?: Database["public"]["Enums"]["template_type"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category_id: string | null
          content: string
          copies_count: number
          created_at: string
          created_by: string | null
          featured: boolean
          id: string
          language: string
          persona: string | null
          published_at: string | null
          segment: string | null
          status: Database["public"]["Enums"]["template_status"]
          submission_id: string | null
          tags: string[] | null
          template_type: Database["public"]["Enums"]["template_type"]
          title: string
          tone: Database["public"]["Enums"]["tone_type"] | null
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          category_id?: string | null
          content: string
          copies_count?: number
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          language?: string
          persona?: string | null
          published_at?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          submission_id?: string | null
          tags?: string[] | null
          template_type: Database["public"]["Enums"]["template_type"]
          title: string
          tone?: Database["public"]["Enums"]["tone_type"] | null
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          category_id?: string | null
          content?: string
          copies_count?: number
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          language?: string
          persona?: string | null
          published_at?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          submission_id?: string | null
          tags?: string[] | null
          template_type?: Database["public"]["Enums"]["template_type"]
          title?: string
          tone?: Database["public"]["Enums"]["tone_type"] | null
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_copy_count: {
        Args: { template_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "contributor" | "user"
      submission_status: "new" | "in_review" | "approved" | "rejected"
      template_status: "published" | "draft" | "archived"
      template_type: "email" | "whatsapp" | "sms"
      tone_type: "formal" | "casual" | "direct" | "friendly" | "urgent"
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
      app_role: ["admin", "moderator", "contributor", "user"],
      submission_status: ["new", "in_review", "approved", "rejected"],
      template_status: ["published", "draft", "archived"],
      template_type: ["email", "whatsapp", "sms"],
      tone_type: ["formal", "casual", "direct", "friendly", "urgent"],
    },
  },
} as const
