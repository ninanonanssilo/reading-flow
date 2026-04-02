export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string
          email: string
          name: string
          password_hash: string
          created_at: string
        }
        Insert: { email: string; name: string; password_hash: string }
        Update: { email?: string; name?: string; password_hash?: string }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          teacher_id: string
          school_year: number
          class_code: string
          created_at: string
        }
        Insert: { name: string; teacher_id: string; school_year?: number; class_code?: string }
        Update: { name?: string; teacher_id?: string; school_year?: number; class_code?: string }
      }
      students: {
        Row: {
          id: string
          classroom_id: string
          name: string
          pin: string
          level: number
          total_sessions: number
          total_stars: number
          badges: unknown[]
          created_at: string
        }
        Insert: { classroom_id: string; name: string; pin: string }
        Update: { name?: string; pin?: string; level?: number; total_sessions?: number; total_stars?: number; badges?: unknown[] }
      }
      sessions: {
        Row: {
          id: string
          student_id: string
          passage_id: string
          goal_type: string
          confidence: number
          transcript: string
          accuracy: number
          cwpm: number
          prosody: number
          error_counts: Record<string, number>
          word_mappings: unknown[]
          self_rating: number | null
          felt_difficulty: boolean | null
          scaffold_data: unknown | null
          hhair_level: string
          reading_started_at: string | null
          reading_ended_at: string | null
          audio_url: string | null
          teacher_memo: string
          created_at: string
        }
        Insert: {
          student_id: string
          passage_id: string
          goal_type: string
          confidence: number
          transcript?: string
          accuracy: number
          cwpm: number
          error_counts: Record<string, number>
          word_mappings: unknown[]
          self_rating?: number | null
          felt_difficulty?: boolean | null
          scaffold_data?: unknown | null
          hhair_level?: string
          reading_started_at?: string | null
          reading_ended_at?: string | null
          audio_url?: string | null
        }
        Update: { teacher_memo?: string; audio_url?: string }
      }
      error_reclassifications: {
        Row: {
          id: string
          session_id: string
          word_index: number
          original_type: string
          reclassified_type: string
          reclassified_by: string
          created_at: string
        }
        Insert: {
          session_id: string
          word_index: number
          original_type: string
          reclassified_type: string
          reclassified_by: string
        }
        Update: Record<string, never>
      }
    }
  }
}
