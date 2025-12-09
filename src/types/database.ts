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
            users: {
                Row: {
                    id: string // maps to auth.users.id
                    name: string | null
                    email: string | null
                    created_at: string
                    timezone: string | null
                    preferences: Json | null // Stores language, notifications, etc.
                }
                Insert: {
                    id: string
                    name?: string | null
                    email?: string | null
                    created_at?: string
                    timezone?: string | null
                    preferences?: Json | null
                }
                Update: {
                    id?: string
                    name?: string | null
                    email?: string | null
                    created_at?: string
                    timezone?: string | null
                    preferences?: Json | null
                }
            }
            nights: {
                Row: {
                    id: string
                    user_id: string
                    date: string // YYYY-MM-DD
                    sleep_start: string | null
                    sleep_end: string | null
                    sleep_quality: number | null
                    pre_sleep_routine_completed: boolean
                    post_sleep_routine_completed: boolean
                    techniques_used: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    sleep_start?: string | null
                    sleep_end?: string | null
                    sleep_quality?: number | null
                    pre_sleep_routine_completed?: boolean
                    post_sleep_routine_completed?: boolean
                    techniques_used?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    sleep_start?: string | null
                    sleep_end?: string | null
                    sleep_quality?: number | null
                    pre_sleep_routine_completed?: boolean
                    post_sleep_routine_completed?: boolean
                    techniques_used?: string[] | null
                    created_at?: string
                }
            }
            dreams: {
                Row: {
                    id: string
                    night_id: string
                    user_id: string
                    title: string | null
                    raw_text: string | null
                    lucid: boolean
                    lucidity_level: number | null
                    emotion_main: string | null
                    emotions: string[] | null
                    tags: string[] | null
                    recall_clarity: number | null
                    voice_note_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    night_id: string
                    user_id: string
                    title?: string | null
                    raw_text?: string | null
                    lucid?: boolean
                    lucidity_level?: number | null
                    emotion_main?: string | null
                    emotions?: string[] | null
                    tags?: string[] | null
                    recall_clarity?: number | null
                    voice_note_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    night_id?: string
                    user_id?: string
                    title?: string | null
                    raw_text?: string | null
                    lucid?: boolean
                    lucidity_level?: number | null
                    emotion_main?: string | null
                    emotions?: string[] | null
                    tags?: string[] | null
                    recall_clarity?: number | null
                    voice_note_url?: string | null
                    created_at?: string
                }
            }
            reality_checks: {
                Row: {
                    id: string
                    user_id: string
                    timestamp: string
                    trigger_type: string | null
                    check_type: string | null
                    completed: boolean
                    user_answer: string | null
                    perceived_state: string | null
                    context: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    timestamp?: string
                    trigger_type?: string | null
                    check_type?: string | null
                    completed?: boolean
                    user_answer?: string | null
                    perceived_state?: string | null
                    context?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    timestamp?: string
                    trigger_type?: string | null
                    check_type?: string | null
                    completed?: boolean
                    user_answer?: string | null
                    perceived_state?: string | null
                    context?: Json | null
                    created_at?: string
                }
            }
            daily_metrics: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    dreams_remembered_count: number
                    lucid_dreams_count: number
                    reality_checks_completed: number
                    pre_sleep_routine_completed: boolean
                    current_streak_days: number
                    longest_streak_days: number
                    technique_usage: Json | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    dreams_remembered_count?: number
                    lucid_dreams_count?: number
                    reality_checks_completed?: number
                    pre_sleep_routine_completed?: boolean
                    current_streak_days?: number
                    longest_streak_days?: number
                    technique_usage?: Json | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    dreams_remembered_count?: number
                    lucid_dreams_count?: number
                    reality_checks_completed?: number
                    pre_sleep_routine_completed?: boolean
                    current_streak_days?: number
                    longest_streak_days?: number
                    technique_usage?: Json | null
                    updated_at?: string
                }
            }
            // Future Expansion: insights, routine_events, techniques
        }
    }
}
