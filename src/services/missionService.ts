import { supabase } from '../lib/supabase';

export interface CompletedMission {
    id: string;
    user_id: string;
    mission_date: string;
    category: 'morning' | 'day' | 'night';
    xp_earned: number;
    completed_at: string;
}

export const missionService = {
    // Get all missions completed by the user on a specific date
    async getMissionsByDate(userId: string, date: string) {
        const { data, error } = await supabase
            .from('completed_missions')
            .select('*')
            .eq('user_id', userId)
            .eq('mission_date', date);

        return { data: data as CompletedMission[] | null, error };
    },

    // Mark a mission as complete
    async completeMission(userId: string, category: 'morning' | 'day' | 'night', xpEarned: number) {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const { data, error } = await supabase
            .from('completed_missions')
            .insert({
                user_id: userId,
                mission_date: date,
                category,
                xp_earned: xpEarned
            } as any)
            .select()
            .single();

        return { data, error };
    }
};
