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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          level: Database["public"]["Enums"]["class_level"]
          present: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          level: Database["public"]["Enums"]["class_level"]
          present?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          level?: Database["public"]["Enums"]["class_level"]
          present?: boolean
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          level: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      homework_assignments: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          file_url: string | null
          id: string
          level: Database["public"]["Enums"]["class_level"]
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          level: Database["public"]["Enums"]["class_level"]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          level?: Database["public"]["Enums"]["class_level"]
          title?: string
        }
        Relationships: []
      }
      homework_submissions: {
        Row: {
          created_at: string
          description: string | null
          feedback: string | null
          file_url: string | null
          grade: number | null
          graded_at: string | null
          id: string
          level: Database["public"]["Enums"]["class_level"]
          status: string
          submitted_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["class_level"]
          status?: string
          submitted_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["class_level"]
          status?: string
          submitted_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: number
          user_id?: string
        }
        Relationships: []
      }
      lesson_recordings: {
        Row: {
          audio_url: string
          created_at: string
          id: string
          lesson_number: number
          level: Database["public"]["Enums"]["class_level"]
          recorded_by: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          id?: string
          lesson_number: number
          level: Database["public"]["Enums"]["class_level"]
          recorded_by: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          id?: string
          lesson_number?: number
          level?: Database["public"]["Enums"]["class_level"]
          recorded_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: Json
          created_at: string
          id: string
          lesson_number: number
          level: Database["public"]["Enums"]["class_level"]
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          lesson_number: number
          level: Database["public"]["Enums"]["class_level"]
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          lesson_number?: number
          level?: Database["public"]["Enums"]["class_level"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          level: Database["public"]["Enums"]["class_level"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          level?: Database["public"]["Enums"]["class_level"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          level?: Database["public"]["Enums"]["class_level"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_recitations: {
        Row: {
          ai_feedback: Json | null
          audio_url: string | null
          ayah_end: number
          ayah_start: number
          created_at: string
          id: string
          score: number | null
          surah_number: number
          teacher_audio_url: string | null
          teacher_feedback: string | null
          teacher_reviewed: boolean
          transcription: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          audio_url?: string | null
          ayah_end?: number
          ayah_start?: number
          created_at?: string
          id?: string
          score?: number | null
          surah_number: number
          teacher_audio_url?: string | null
          teacher_feedback?: string | null
          teacher_reviewed?: boolean
          transcription?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          audio_url?: string | null
          ayah_end?: number
          ayah_start?: number
          created_at?: string
          id?: string
          score?: number | null
          surah_number?: number
          teacher_audio_url?: string | null
          teacher_feedback?: string | null
          teacher_reviewed?: boolean
          transcription?: string | null
          user_id?: string
        }
        Relationships: []
      }
      teacher_audio_clips: {
        Row: {
          audio_key: string
          audio_url: string
          created_at: string
          id: string
          lesson_number: number
          level: Database["public"]["Enums"]["class_level"]
          recorded_by: string
          updated_at: string
        }
        Insert: {
          audio_key: string
          audio_url: string
          created_at?: string
          id?: string
          lesson_number: number
          level: Database["public"]["Enums"]["class_level"]
          recorded_by: string
          updated_at?: string
        }
        Update: {
          audio_key?: string
          audio_url?: string
          created_at?: string
          id?: string
          lesson_number?: number
          level?: Database["public"]["Enums"]["class_level"]
          recorded_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_recordings: {
        Row: {
          audio_url: string
          created_at: string
          id: string
          surah_number: number
          teacher_id: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          id?: string
          surah_number: number
          teacher_id: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          id?: string
          surah_number?: number
          teacher_id?: string
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
      vocal_profiles: {
        Row: {
          created_at: string
          elevenlabs_voice_id: string | null
          id: string
          reference_audio_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          elevenlabs_voice_id?: string | null
          id?: string
          reference_audio_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          elevenlabs_voice_id?: string | null
          id?: string
          reference_audio_url?: string
          updated_at?: string
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
      is_admin_or_teacher: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
      class_level: "niveau_1" | "niveau_2"
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
      app_role: ["admin", "teacher", "student"],
      class_level: ["niveau_1", "niveau_2"],
    },
  },
} as const
