import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          address: string
          display_name: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          display_name: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          display_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          code: string
          host_address: string
          theme?: string
          max_players: number
          status: 'waiting' | 'starting' | 'in_progress' | 'completed'
          is_public: boolean
          time_limit?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          host_address: string
          theme?: string
          max_players?: number
          status?: 'waiting' | 'starting' | 'in_progress' | 'completed'
          is_public?: boolean
          time_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          host_address?: string
          theme?: string
          max_players?: number
          status?: 'waiting' | 'starting' | 'in_progress' | 'completed'
          is_public?: boolean
          time_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_address: string
          joined_at: string
          status: 'active' | 'left' | 'disconnected'
        }
        Insert: {
          id?: string
          room_id: string
          user_address: string
          joined_at?: string
          status?: 'active' | 'left' | 'disconnected'
        }
        Update: {
          id?: string
          room_id?: string
          user_address?: string
          joined_at?: string
          status?: 'active' | 'left' | 'disconnected'
        }
      }
      games: {
        Row: {
          id: string
          room_id: string
          status: 'waiting' | 'drawing' | 'voting' | 'completed'
          prompt?: string
          time_limit?: number
          started_at?: string
          ended_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          status?: 'waiting' | 'drawing' | 'voting' | 'completed'
          prompt?: string
          time_limit?: number
          started_at?: string
          ended_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          status?: 'waiting' | 'drawing' | 'voting' | 'completed'
          prompt?: string
          time_limit?: number
          started_at?: string
          ended_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          game_id: string
          user_address: string
          drawing_data: string
          description: string
          submitted_at: string
          ai_score?: number
          ai_feedback?: string
          ai_criteria?: {
            accuracy: number
            creativity: number
            technique: number
            completeness: number
          }
          scored_at?: string
        }
        Insert: {
          id?: string
          game_id: string
          user_address: string
          drawing_data: string
          description: string
          submitted_at?: string
          ai_score?: number
          ai_feedback?: string
          ai_criteria?: {
            accuracy: number
            creativity: number
            technique: number
            completeness: number
          }
          scored_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_address?: string
          drawing_data?: string
          description?: string
          submitted_at?: string
          ai_score?: number
          ai_feedback?: string
          ai_criteria?: {
            accuracy: number
            creativity: number
            technique: number
            completeness: number
          }
          scored_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          game_id: string
          voter_address: string
          submission_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          game_id: string
          voter_address: string
          submission_id: string
          voted_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          voter_address?: string
          submission_id?: string
          voted_at?: string
        }
      }
    }
  }
}
