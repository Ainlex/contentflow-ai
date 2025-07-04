export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          company_name: string | null
          industry: string | null
          brand_voice: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
          company_size: string | null
          role: string | null
          website_url: string | null
          target_audience: string | null
          business_goals: string[] | null
          brand_voice_tone: string | null
          content_examples: string[] | null
          key_messages: string | null
          words_to_avoid: string | null
          content_types: string[] | null
          posting_frequency: string | null
          content_themes: string[] | null
          social_accounts: Json | null
        }
        Insert: {
          id: string
          email: string
          company_name?: string | null
          industry?: string | null
          brand_voice?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          company_size?: string | null
          role?: string | null
          website_url?: string | null
          target_audience?: string | null
          business_goals?: string[] | null
          brand_voice_tone?: string | null
          content_examples?: string[] | null
          key_messages?: string | null
          words_to_avoid?: string | null
          content_types?: string[] | null
          posting_frequency?: string | null
          content_themes?: string[] | null
          social_accounts?: Json | null
        }
        Update: {
          id?: string
          email?: string
          company_name?: string | null
          industry?: string | null
          brand_voice?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          company_size?: string | null
          role?: string | null
          website_url?: string | null
          target_audience?: string | null
          business_goals?: string[] | null
          brand_voice_tone?: string | null
          content_examples?: string[] | null
          key_messages?: string | null
          words_to_avoid?: string | null
          content_types?: string[] | null
          posting_frequency?: string | null
          content_themes?: string[] | null
          social_accounts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'trial' | 'starter' | 'professional' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due'
          trial_ends_at: string | null
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'trial' | 'starter' | 'professional' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due'
          trial_ends_at?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'trial' | 'starter' | 'professional' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          trial_ends_at?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          ai_generations_used: number
          social_accounts_connected: number
          month_year: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ai_generations_used?: number
          social_accounts_connected?: number
          month_year: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ai_generations_used?: number
          social_accounts_connected?: number
          month_year?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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