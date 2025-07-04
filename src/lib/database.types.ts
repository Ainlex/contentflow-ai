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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_name?: string | null
          industry?: string | null
          brand_voice?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_name?: string | null
          industry?: string | null
          brand_voice?: string | null
          created_at?: string
          updated_at?: string
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