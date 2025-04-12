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
      admin_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          role: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          name: string
          role?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: string
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          active: boolean | null
          created_at: string
          created_by: string | null
          for_parent: boolean | null
          id: string
          options: Json | null
          question: string
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          for_parent?: boolean | null
          id?: string
          options?: Json | null
          question: string
          type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          for_parent?: boolean | null
          id?: string
          options?: Json | null
          question?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_reports: {
        Row: {
          assessment_type: string
          child_id: string | null
          completed_at: string
          id: string
          score: Json | null
        }
        Insert: {
          assessment_type: string
          child_id?: string | null
          completed_at?: string
          id?: string
          score?: Json | null
        }
        Update: {
          assessment_type?: string
          child_id?: string | null
          completed_at?: string
          id?: string
          score?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          active: boolean | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          requirements: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          requirements?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
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
      daily_questions: {
        Row: {
          active: boolean | null
          age_range: unknown | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          question: string
        }
        Insert: {
          active?: boolean | null
          age_range?: unknown | null
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          question: string
        }
        Update: {
          active?: boolean | null
          age_range?: unknown | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      emotional_trends: {
        Row: {
          child_id: string | null
          emotion: string
          id: string
          intensity: number | null
          recorded_at: string
        }
        Insert: {
          child_id?: string | null
          emotion: string
          id?: string
          intensity?: number | null
          recorded_at?: string
        }
        Update: {
          child_id?: string | null
          emotion?: string
          id?: string
          intensity?: number | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotional_trends_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          challenge: string | null
          child_id: string | null
          confidence: number | null
          content: string
          created_at: string
          exercise: number | null
          gratitude: string | null
          id: string
          kindness: number | null
          mindfulness: number | null
          mood: string | null
          mood_intensity: number | null
          positivity: number | null
          sleep: number | null
          title: string | null
          tomorrow_plan: string | null
          water: number | null
          went_badly: string | null
          went_well: string | null
        }
        Insert: {
          challenge?: string | null
          child_id?: string | null
          confidence?: number | null
          content: string
          created_at?: string
          exercise?: number | null
          gratitude?: string | null
          id?: string
          kindness?: number | null
          mindfulness?: number | null
          mood?: string | null
          mood_intensity?: number | null
          positivity?: number | null
          sleep?: number | null
          title?: string | null
          tomorrow_plan?: string | null
          water?: number | null
          went_badly?: string | null
          went_well?: string | null
        }
        Update: {
          challenge?: string | null
          child_id?: string | null
          confidence?: number | null
          content?: string
          created_at?: string
          exercise?: number | null
          gratitude?: string | null
          id?: string
          kindness?: number | null
          mindfulness?: number | null
          mood?: string | null
          mood_intensity?: number | null
          positivity?: number | null
          sleep?: number | null
          title?: string | null
          tomorrow_plan?: string | null
          water?: number | null
          went_badly?: string | null
          went_well?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_monitoring: {
        Row: {
          child_id: string | null
          created_at: string
          entry_id: string
          flag_reason: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          entry_id: string
          flag_reason: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity: string
          status?: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          entry_id?: string
          flag_reason?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_monitoring_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_monitoring_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_quotes: {
        Row: {
          active: boolean | null
          author: string | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          quote: string
        }
        Insert: {
          active?: boolean | null
          author?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          quote: string
        }
        Update: {
          active?: boolean | null
          author?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          quote?: string
        }
        Relationships: [
          {
            foreignKeyName: "motivational_quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          active: boolean | null
          body_template: string
          created_at: string
          created_by: string | null
          description: string | null
          for_parent: boolean | null
          id: string
          name: string
          title_template: string
          trigger_event: string
        }
        Insert: {
          active?: boolean | null
          body_template: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          for_parent?: boolean | null
          id?: string
          name: string
          title_template: string
          trigger_event: string
        }
        Update: {
          active?: boolean | null
          body_template?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          for_parent?: boolean | null
          id?: string
          name?: string
          title_template?: string
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
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
      roleplay_scenarios: {
        Row: {
          active: boolean | null
          age_range: unknown | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          difficulty: string | null
          id: string
          title: string
        }
        Insert: {
          active?: boolean | null
          age_range?: unknown | null
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          difficulty?: string | null
          id?: string
          title: string
        }
        Update: {
          active?: boolean | null
          age_range?: unknown | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          difficulty?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roleplay_scenarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      sel_insights: {
        Row: {
          child_id: string
          created_at: string
          id: string
          relationship_skills: number
          responsible_decision_making: number
          self_awareness: number
          self_management: number
          social_awareness: number
          source_text: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          relationship_skills: number
          responsible_decision_making: number
          self_awareness: number
          self_management: number
          social_awareness: number
          source_text?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          relationship_skills?: number
          responsible_decision_making?: number
          self_awareness?: number
          self_management?: number
          social_awareness?: number
          source_text?: string | null
        }
        Relationships: []
      }
      streak_rules: {
        Row: {
          active: boolean | null
          created_at: string
          created_by: string | null
          days_required: number
          description: string | null
          id: string
          name: string
          required_actions: Json
          reward_badge: string | null
          reward_xp: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          days_required: number
          description?: string | null
          id?: string
          name: string
          required_actions: Json
          reward_badge?: string | null
          reward_xp?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          days_required?: number
          description?: string | null
          id?: string
          name?: string
          required_actions?: Json
          reward_badge?: string | null
          reward_xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streak_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      xp_allocation_rules: {
        Row: {
          action_type: string
          active: boolean | null
          cooldown_minutes: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          xp_amount: number
        }
        Insert: {
          action_type: string
          active?: boolean | null
          cooldown_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          xp_amount: number
        }
        Update: {
          action_type?: string
          active?: boolean | null
          cooldown_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_allocation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_admin_user: {
        Args: { p_email: string; p_name: string; p_role?: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
