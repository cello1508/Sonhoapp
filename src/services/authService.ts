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
        return { data, error };
    },

    async updateOnboardingStatus(userId: string, completed: boolean) {
        // 1. Get current preferences to not overwrite others
        const { data: user, error: fetchError } = await (supabase
            .from('users') as any)
            .select('preferences')
            .eq('id', userId)
            .single();

        if (fetchError) return { error: fetchError };

        const currentPrefs = (user?.preferences as Record<string, any>) || {};
        const newPrefs = { ...currentPrefs, onboarding_completed: completed };

        // 2. Update
        const { error } = await (supabase
            .from('users') as any)
            .update({ preferences: newPrefs })
            .eq('id', userId);

        return { error };
    },
};
