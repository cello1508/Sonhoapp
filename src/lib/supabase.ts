import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // We don't throw error to avoid crashing app during build/dev without env vars
    console.warn('Supabase env vars missing. Database features will not work.');
}

export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
