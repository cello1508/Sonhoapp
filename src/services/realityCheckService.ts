import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type RealityCheckInsert = Database['public']['Tables']['reality_checks']['Insert'];

export const realityCheckService = {
    async logCheck(check: RealityCheckInsert) {
        const { data, error } = await (supabase
            .from('reality_checks') as any)
            .insert(check)
            .select()
            .single();
        return { data, error };
    },

    async getRecentChecks(userId: string, limit = 10) {
        const { data, error } = await supabase
            .from('reality_checks')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    async getChecksCountToday(userId: string) {
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
            .from('reality_checks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('timestamp', `${today}T00:00:00`)
            .lte('timestamp', `${today}T23:59:59`);

        return { count, error };
    }
};
