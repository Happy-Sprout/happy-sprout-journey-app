export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      child_preferences: {
        Row: {
          challenges: string[] | null
          child_id: string
          created_at: string
          id: string
          interests: string[] | null
          learning_styles: string[] | null
          story_preferences: string[] | null
          strengths: string[] | null
        }
        Insert: {
          challenges?: string[] | null
          child_id: string
          created_at?: string
          id?: string
          interests?: string[] | null
          learning_styles?: string[] | null
          story_preferences?: string[] | null
          strengths?: string[] | null
        }
        Update: {
          challenges?: string[] | null
          child_id?: string
          created_at?: string
          id?: string
          interests?: string[] | null
          learning_styles?: string[] | null
          story_preferences?: string[] | null
          strengths?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "child_preferences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_progress: {
        Row: {
          badges: string[] | null
          child_id: string
          created_at: string
          daily_check_in_completed: boolean | null
          id: string
          last_check_in: string | null
          streak_count: number | null
          xp_points: number | null
        }
        Insert: {
          badges?: string[] | null
          child_id: string
          created_at?: string
          daily_check_in_completed?: boolean | null
          id?: string
          last_check_in?: string | null
          streak_count?: number | null
          xp_points?: number | null
        }
        Update: {
          badges?: string[] | null
          child_id?: string
          created_at?: string
          daily_check_in_completed?: boolean | null
          id?: string
          last_check_in?: string | null
          streak_count?: number | null
          xp_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "child_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          age: number
          avatar: string | null
          created_at: string
          creation_status: string | null
          date_of_birth: string
          gender: string | null
          grade: string
          id: string
          nickname: string
          parent_id: string
          relationship_to_parent: string | null
        }
        Insert: {
          age: number
          avatar?: string | null
          created_at?: string
          creation_status?: string | null
          date_of_birth: string
          gender?: string | null
          grade: string
          id: string
          nickname: string
          parent_id: string
          relationship_to_parent?: string | null
        }
        Update: {
          age?: number
          avatar?: string | null
          created_at?: string
          creation_status?: string | null
          date_of_birth?: string
          gender?: string | null
          grade?: string
          id?: string
          nickname?: string
          parent_id?: string
          relationship_to_parent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          additional_info: string | null
          created_at: string
          email: string
          emergency_contact: string
          id: string
          name: string
          relationship: string
        }
        Insert: {
          additional_info?: string | null
          created_at?: string
          email: string
          emergency_contact: string
          id: string
          name: string
          relationship: string
        }
        Update: {
          additional_info?: string | null
          created_at?: string
          email?: string
          emergency_contact?: string
          id?: string
          name?: string
          relationship?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
