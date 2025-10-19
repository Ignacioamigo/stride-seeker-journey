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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          average_pace: string | null
          calories: number | null
          created_at: string | null
          distance: number | null
          duration: number | null
          elevation_gain: number | null
          end_time: string | null
          id: string
          max_pace: string | null
          name: string
          notes: string | null
          route: Json | null
          start_time: string
          type: string
          updated_at: string | null
          user_id: string | null
          weather_conditions: Json | null
        }
        Insert: {
          average_pace?: string | null
          calories?: number | null
          created_at?: string | null
          distance?: number | null
          duration?: number | null
          elevation_gain?: number | null
          end_time?: string | null
          id?: string
          max_pace?: string | null
          name: string
          notes?: string | null
          route?: Json | null
          start_time: string
          type: string
          updated_at?: string | null
          user_id?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          average_pace?: string | null
          calories?: number | null
          created_at?: string | null
          distance?: number | null
          duration?: number | null
          elevation_gain?: number | null
          end_time?: string | null
          id?: string
          max_pace?: string | null
          name?: string
          notes?: string | null
          route?: Json | null
          start_time?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
          weather_conditions?: Json | null
        }
        Relationships: []
      }
      fragments: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      published_activities_simple: {
        Row: {
          activity_date: string | null
          calories: number | null
          created_at: string | null
          description: string | null
          distance: number
          duration: string
          entrenamiento_id: string | null
          gps_points: Json | null
          id: string
          image_url: string | null
          is_public: boolean | null
          title: string
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          workout_type: string | null
        }
        Insert: {
          activity_date?: string | null
          calories?: number | null
          created_at?: string | null
          description?: string | null
          distance?: number
          duration?: string
          entrenamiento_id?: string | null
          gps_points?: Json | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          workout_type?: string | null
        }
        Update: {
          activity_date?: string | null
          calories?: number | null
          created_at?: string | null
          description?: string | null
          distance?: number
          duration?: string
          entrenamiento_id?: string | null
          gps_points?: Json | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          workout_type?: string | null
        }
        Relationships: []
      }
      races: {
        Row: {
          autonomous_community: string | null
          categories: Json | null
          championship_level: string | null
          circuit_name: string | null
          circuit_type: string | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          coordinates: unknown | null
          country: string | null
          created_at: string | null
          current_participants: number | null
          data_quality_score: number | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          distance_km: number | null
          distance_text: string | null
          distances: Json | null
          elevation_gain: number | null
          event_date: string
          event_time: string | null
          expected_weather: Json | null
          features: Json | null
          guide_runners_allowed: boolean | null
          id: string
          image_url: string | null
          includes_medal: boolean | null
          includes_tshirt: boolean | null
          is_championship: boolean | null
          is_qualifying_race: boolean | null
          last_verified: string | null
          live_tracking_url: string | null
          max_participants: number | null
          name: string
          needs_manual_review: boolean | null
          next_scrape_due: string | null
          organizer: string | null
          poster_url: string | null
          price_details: Json | null
          prizes: Json | null
          province: string
          qualifying_for: string | null
          race_pack_info: string | null
          race_type: Database["public"]["Enums"]["race_type"]
          registration_deadline: string | null
          registration_price: number | null
          registration_status: Database["public"]["Enums"]["race_status"] | null
          registration_url: string | null
          results_url: string | null
          review_notes: string | null
          scraped_at: string | null
          series_name: string | null
          series_points: number | null
          social_media: Json | null
          source_event_id: string | null
          source_platform: string
          source_url: string
          special_categories: Json | null
          start_location: string | null
          surface_type: string | null
          timing_company: string | null
          timing_system: string | null
          updated_at: string | null
          venue: string | null
          website: string | null
          wheelchair_accessible: boolean | null
        }
        Insert: {
          autonomous_community?: string | null
          categories?: Json | null
          championship_level?: string | null
          circuit_name?: string | null
          circuit_type?: string | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: unknown | null
          country?: string | null
          created_at?: string | null
          current_participants?: number | null
          data_quality_score?: number | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          distance_km?: number | null
          distance_text?: string | null
          distances?: Json | null
          elevation_gain?: number | null
          event_date: string
          event_time?: string | null
          expected_weather?: Json | null
          features?: Json | null
          guide_runners_allowed?: boolean | null
          id?: string
          image_url?: string | null
          includes_medal?: boolean | null
          includes_tshirt?: boolean | null
          is_championship?: boolean | null
          is_qualifying_race?: boolean | null
          last_verified?: string | null
          live_tracking_url?: string | null
          max_participants?: number | null
          name: string
          needs_manual_review?: boolean | null
          next_scrape_due?: string | null
          organizer?: string | null
          poster_url?: string | null
          price_details?: Json | null
          prizes?: Json | null
          province: string
          qualifying_for?: string | null
          race_pack_info?: string | null
          race_type: Database["public"]["Enums"]["race_type"]
          registration_deadline?: string | null
          registration_price?: number | null
          registration_status?:
            | Database["public"]["Enums"]["race_status"]
            | null
          registration_url?: string | null
          results_url?: string | null
          review_notes?: string | null
          scraped_at?: string | null
          series_name?: string | null
          series_points?: number | null
          social_media?: Json | null
          source_event_id?: string | null
          source_platform: string
          source_url: string
          special_categories?: Json | null
          start_location?: string | null
          surface_type?: string | null
          timing_company?: string | null
          timing_system?: string | null
          updated_at?: string | null
          venue?: string | null
          website?: string | null
          wheelchair_accessible?: boolean | null
        }
        Update: {
          autonomous_community?: string | null
          categories?: Json | null
          championship_level?: string | null
          circuit_name?: string | null
          circuit_type?: string | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: unknown | null
          country?: string | null
          created_at?: string | null
          current_participants?: number | null
          data_quality_score?: number | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          distance_km?: number | null
          distance_text?: string | null
          distances?: Json | null
          elevation_gain?: number | null
          event_date?: string
          event_time?: string | null
          expected_weather?: Json | null
          features?: Json | null
          guide_runners_allowed?: boolean | null
          id?: string
          image_url?: string | null
          includes_medal?: boolean | null
          includes_tshirt?: boolean | null
          is_championship?: boolean | null
          is_qualifying_race?: boolean | null
          last_verified?: string | null
          live_tracking_url?: string | null
          max_participants?: number | null
          name?: string
          needs_manual_review?: boolean | null
          next_scrape_due?: string | null
          organizer?: string | null
          poster_url?: string | null
          price_details?: Json | null
          prizes?: Json | null
          province?: string
          qualifying_for?: string | null
          race_pack_info?: string | null
          race_type?: Database["public"]["Enums"]["race_type"]
          registration_deadline?: string | null
          registration_price?: number | null
          registration_status?:
            | Database["public"]["Enums"]["race_status"]
            | null
          registration_url?: string | null
          results_url?: string | null
          review_notes?: string | null
          scraped_at?: string | null
          series_name?: string | null
          series_points?: number | null
          social_media?: Json | null
          source_event_id?: string | null
          source_platform?: string
          source_url?: string
          special_categories?: Json | null
          start_location?: string | null
          surface_type?: string | null
          timing_company?: string | null
          timing_system?: string | null
          updated_at?: string | null
          venue?: string | null
          website?: string | null
          wheelchair_accessible?: boolean | null
        }
        Relationships: []
      }
      simple_workouts: {
        Row: {
          created_at: string
          distance_km: number
          duration_minutes: number
          id: string
          plan_id: string | null
          updated_at: string
          user_id: string
          week_number: number | null
          workout_date: string
          workout_title: string
          workout_type: string
        }
        Insert: {
          created_at?: string
          distance_km?: number
          duration_minutes?: number
          id?: string
          plan_id?: string | null
          updated_at?: string
          user_id: string
          week_number?: number | null
          workout_date?: string
          workout_title: string
          workout_type?: string
        }
        Update: {
          created_at?: string
          distance_km?: number
          duration_minutes?: number
          id?: string
          plan_id?: string | null
          updated_at?: string
          user_id?: string
          week_number?: number | null
          workout_date?: string
          workout_title?: string
          workout_type?: string
        }
        Relationships: []
      }
      strava_tokens: {
        Row: {
          access_token: string
          athlete_id: number
          created_at: string | null
          expires_at: number
          refresh_token: string
          scopes: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          athlete_id: number
          created_at?: string | null
          expires_at: number
          refresh_token: string
          scopes: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          athlete_id?: number
          created_at?: string | null
          expires_at?: number
          refresh_token?: string
          scopes?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_weeks: number | null
          goal: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          completed_onboarding: boolean | null
          created_at: string | null
          experience_level: string | null
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          injuries: string | null
          max_distance: number | null
          name: string | null
          pace: string | null
          selected_days: Json | null
          updated_at: string | null
          user_auth_id: string | null
          user_id: string | null
          weekly_workouts: number | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          completed_onboarding?: boolean | null
          created_at?: string | null
          experience_level?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          injuries?: string | null
          max_distance?: number | null
          name?: string | null
          pace?: string | null
          selected_days?: Json | null
          updated_at?: string | null
          user_auth_id?: string | null
          user_id?: string | null
          weekly_workouts?: number | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          completed_onboarding?: boolean | null
          created_at?: string | null
          experience_level?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          injuries?: string | null
          max_distance?: number | null
          name?: string | null
          pace?: string | null
          selected_days?: Json | null
          updated_at?: string | null
          user_auth_id?: string | null
          user_id?: string | null
          weekly_workouts?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      workouts_simple: {
        Row: {
          app_version: string | null
          completed_date: string | null
          created_at: string | null
          distance: number | null
          duration_minutes: number | null
          id: string
          notes: string | null
          plan_info: string | null
          updated_at: string | null
          user_email: string | null
          user_name: string | null
          week_number: number | null
          workout_title: string
          workout_type: string | null
        }
        Insert: {
          app_version?: string | null
          completed_date?: string | null
          created_at?: string | null
          distance?: number | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_info?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          week_number?: number | null
          workout_title?: string
          workout_type?: string | null
        }
        Update: {
          app_version?: string | null
          completed_date?: string | null
          created_at?: string | null
          distance?: number | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          plan_info?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          week_number?: number | null
          workout_title?: string
          workout_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_races: {
        Row: {
          autonomous_community: string | null
          categories: Json | null
          championship_level: string | null
          circuit_name: string | null
          circuit_type: string | null
          city: string | null
          created_at: string | null
          current_participants: number | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          distance_km: number | null
          distance_text: string | null
          distances: Json | null
          elevation_gain: number | null
          event_date: string | null
          event_time: string | null
          features: Json | null
          guide_runners_allowed: boolean | null
          id: string | null
          image_url: string | null
          includes_medal: boolean | null
          includes_tshirt: boolean | null
          is_championship: boolean | null
          is_qualifying_race: boolean | null
          max_participants: number | null
          name: string | null
          organizer: string | null
          poster_url: string | null
          price_details: Json | null
          prizes: Json | null
          province: string | null
          qualifying_for: string | null
          race_type: Database["public"]["Enums"]["race_type"] | null
          registration_deadline: string | null
          registration_price: number | null
          registration_status: Database["public"]["Enums"]["race_status"] | null
          registration_url: string | null
          series_name: string | null
          special_categories: Json | null
          surface_type: string | null
          updated_at: string | null
          venue: string | null
          website: string | null
          wheelchair_accessible: boolean | null
        }
        Insert: {
          autonomous_community?: string | null
          categories?: Json | null
          championship_level?: string | null
          circuit_name?: string | null
          circuit_type?: string | null
          city?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          distance_km?: number | null
          distance_text?: string | null
          distances?: Json | null
          elevation_gain?: number | null
          event_date?: string | null
          event_time?: string | null
          features?: Json | null
          guide_runners_allowed?: boolean | null
          id?: string | null
          image_url?: string | null
          includes_medal?: boolean | null
          includes_tshirt?: boolean | null
          is_championship?: boolean | null
          is_qualifying_race?: boolean | null
          max_participants?: number | null
          name?: string | null
          organizer?: string | null
          poster_url?: string | null
          price_details?: Json | null
          prizes?: Json | null
          province?: string | null
          qualifying_for?: string | null
          race_type?: Database["public"]["Enums"]["race_type"] | null
          registration_deadline?: string | null
          registration_price?: number | null
          registration_status?:
            | Database["public"]["Enums"]["race_status"]
            | null
          registration_url?: string | null
          series_name?: string | null
          special_categories?: Json | null
          surface_type?: string | null
          updated_at?: string | null
          venue?: string | null
          website?: string | null
          wheelchair_accessible?: boolean | null
        }
        Update: {
          autonomous_community?: string | null
          categories?: Json | null
          championship_level?: string | null
          circuit_name?: string | null
          circuit_type?: string | null
          city?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          distance_km?: number | null
          distance_text?: string | null
          distances?: Json | null
          elevation_gain?: number | null
          event_date?: string | null
          event_time?: string | null
          features?: Json | null
          guide_runners_allowed?: boolean | null
          id?: string | null
          image_url?: string | null
          includes_medal?: boolean | null
          includes_tshirt?: boolean | null
          is_championship?: boolean | null
          is_qualifying_race?: boolean | null
          max_participants?: number | null
          name?: string | null
          organizer?: string | null
          poster_url?: string | null
          price_details?: Json | null
          prizes?: Json | null
          province?: string | null
          qualifying_for?: string | null
          race_type?: Database["public"]["Enums"]["race_type"] | null
          registration_deadline?: string | null
          registration_price?: number | null
          registration_status?:
            | Database["public"]["Enums"]["race_status"]
            | null
          registration_url?: string | null
          series_name?: string | null
          special_categories?: Json | null
          surface_type?: string | null
          updated_at?: string | null
          venue?: string | null
          website?: string | null
          wheelchair_accessible?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      contextual_search_fragments: {
        Args: {
          distance_goal?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
          user_level?: string
          workout_type?: string
        }
        Returns: {
          content: string
          final_score: number
          id: string
          metadata: Json
          relevance_boost: number
          similarity: number
        }[]
      }
      get_user_id_for_activity: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      hybrid_search_fragments: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text?: string
        }
        Returns: {
          combined_score: number
          content: string
          id: string
          metadata: Json
          similarity: number
          text_rank: number
        }[]
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_fragments: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      search_races: {
        Args: {
          date_from?: string
          date_to?: string
          limit_count?: number
          max_distance?: number
          provinces?: string[]
          race_types?: string[]
          search_term?: string
        }
        Returns: {
          city: string
          distance_km: number
          event_date: string
          id: string
          name: string
          province: string
          race_type: Database["public"]["Enums"]["race_type"]
          rank: number
          registration_status: Database["public"]["Enums"]["race_status"]
          registration_url: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      difficulty_level: "principiante" | "intermedio" | "avanzado" | "elite"
      race_status:
        | "upcoming"
        | "registration_open"
        | "registration_closed"
        | "completed"
        | "cancelled"
        | "postponed"
      race_type:
        | "carrera_popular"
        | "trail_running"
        | "media_maraton"
        | "maraton"
        | "cross"
        | "montaña"
        | "ultra_trail"
        | "canicross"
        | "triathlon"
        | "duathlon"
        | "acuathlon"
        | "solidaria"
        | "nocturna"
        | "virtual"
        | "otros"
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
      difficulty_level: ["principiante", "intermedio", "avanzado", "elite"],
      race_status: [
        "upcoming",
        "registration_open",
        "registration_closed",
        "completed",
        "cancelled",
        "postponed",
      ],
      race_type: [
        "carrera_popular",
        "trail_running",
        "media_maraton",
        "maraton",
        "cross",
        "montaña",
        "ultra_trail",
        "canicross",
        "triathlon",
        "duathlon",
        "acuathlon",
        "solidaria",
        "nocturna",
        "virtual",
        "otros",
      ],
    },
  },
} as const
