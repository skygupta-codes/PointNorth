// Supabase client utilities
// Full setup in Day 2 when Supabase is configured

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Browser client (uses anon key with RLS)
export const supabase = supabaseUrl
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Server client (uses service role key — bypasses RLS)
export function getSupabaseAdmin() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return null;

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
