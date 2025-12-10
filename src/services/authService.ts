import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';



export const authService = {
    // Sign Up with Email/Password
    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { data, error };
    },

    // Sign In with Email/Password
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        return { data, error };
    },

    async getUser() {
        const { data, error } = await supabase.auth.getUser();
        return { data, error };
    },

    async getProfile(userId: string) {
        const { data, error } = await (supabase
            .from('users') as any)
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },

    async updateProfile(userId: string, updates: Database['public']['Tables']['users']['Update']) {
        const { data, error } = await (supabase
            .from('users') as any)
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        // If name is being updated, also sync to Auth Metadata for immediate UI feedback
        if (!error && updates.name) {
            await supabase.auth.updateUser({
                data: { name: updates.name }
            });
        }

        return { data, error };
    },

    async updatePreferences(userId: string, newPrefs: Record<string, any>) {
        // 1. Get current preferences
        const { data: user, error: fetchError } = await (supabase
            .from('users') as any)
            .select('preferences')
            .eq('id', userId)
            .single();

        if (fetchError) return { error: fetchError };

        const currentPrefs = (user?.preferences as Record<string, any>) || {};
        const mergedPrefs = { ...currentPrefs, ...newPrefs };

        // 2. Update
        const { error } = await (supabase
            .from('users') as any)
            .update({ preferences: mergedPrefs })
            .eq('id', userId);

        return { error };
    },

    // Legacy support or specific wrapper
    async updateOnboardingStatus(userId: string, completed: boolean) {
        return this.updatePreferences(userId, { onboarding_completed: completed });
    },

    // Save User Stats (XP, Streak, etc.) - Stored in 'preferences' for now to avoid schema changes
    async updateUserStats(userId: string, stats: any) {
        return this.updatePreferences(userId, { stats });
    }
};
