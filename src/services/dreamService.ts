import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type Night = Database['public']['Tables']['nights']['Row'];

type NightInsert = Database['public']['Tables']['nights']['Insert'];
type DreamInsert = Database['public']['Tables']['dreams']['Insert'];

export const dreamService = {
    // --- Nights ---
    async createNight(night: NightInsert): Promise<{ data: Night | null; error: PostgrestError | null; }> {
        const { data, error } = await (supabase
            .from('nights') as any)
            .insert(night)
            .select()
            .single();
        return { data, error };
    },

    async getRecentNights(userId: string, limit = 7) {
        const { data, error } = await (supabase
            .from('nights') as any)
            .select(`
        *,
        dreams (*)
      `)
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    async getNightByDate(userId: string, date: string) {
        const { data, error } = await (supabase
            .from('nights') as any)
            .select(`
        *,
        dreams (*)
      `)
            .eq('user_id', userId)
            .eq('date', date)
            .single();
        return { data, error };
    },

    // --- Dreams ---
    async addDream(dream: DreamInsert) {
        const { data, error } = await (supabase
            .from('dreams') as any)
            .insert(dream)
            .select()
            .single();
        return { data, error };
    },

    async updateDream(dreamId: string, updates: Database['public']['Tables']['dreams']['Update']) {
        const { data, error } = await (supabase
            .from('dreams') as any)
            .update(updates)
            .eq('id', dreamId)
            .select()
            .single();
        return { data, error };
    },

    async deleteDream(dreamId: string) {
        const { error } = await (supabase
            .from('dreams') as any)
            .delete()
            .eq('id', dreamId);
        return { error };
    },

    // --- Stats ---
    async getDreamsCount(userId: string) {
        const { count, error } = await (supabase
            .from('dreams') as any)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        return { count, error };
    }
};
