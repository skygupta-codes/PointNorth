-- Migration: Enable Row Level Security on all public tables
-- Date: 2026-03-04
-- Purpose: Fix Supabase security linter warnings (rls_disabled_in_public, sensitive_columns_exposed)
--
-- Since this app uses Clerk for auth (not Supabase Auth), auth.uid() won't be populated
-- in browser requests. The RLS policies effectively deny all direct anon-key API access,
-- which is correct — all legitimate data access goes through server-side Drizzle ORM
-- (which uses DATABASE_URL / service role and bypasses RLS).

BEGIN;

-- ============================================================
-- 1. USERS
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own row (matched by Clerk ID)
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING (auth.uid()::text = clerk_id);

-- Allow authenticated users to update their own row
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    USING (auth.uid()::text = clerk_id);

-- Allow inserts only from service role (webhook creates users)
-- No INSERT policy = denied for anon/authenticated

-- ============================================================
-- 2. USER_CARDS
-- ============================================================
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_cards_select_own" ON public.user_cards
    FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "user_cards_insert_own" ON public.user_cards
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "user_cards_update_own" ON public.user_cards
    FOR UPDATE
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "user_cards_delete_own" ON public.user_cards
    FOR DELETE
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- ============================================================
-- 3. CHAT_MESSAGES
-- ============================================================
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select_own" ON public.chat_messages
    FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "chat_messages_insert_own" ON public.chat_messages
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "chat_messages_delete_own" ON public.chat_messages
    FOR DELETE
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- ============================================================
-- 4. SPENDING_PROFILES
-- ============================================================
ALTER TABLE public.spending_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spending_profiles_select_own" ON public.spending_profiles
    FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "spending_profiles_insert_own" ON public.spending_profiles
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "spending_profiles_update_own" ON public.spending_profiles
    FOR UPDATE
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- ============================================================
-- 5. POINTS_HISTORY
-- ============================================================
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "points_history_select_own" ON public.points_history
    FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- No INSERT/UPDATE/DELETE — history is append-only from server

-- ============================================================
-- 6. USER_LOYALTY_ACCOUNTS (contains sensitive account_number column)
-- ============================================================
ALTER TABLE public.user_loyalty_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_loyalty_accounts_select_own" ON public.user_loyalty_accounts
    FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "user_loyalty_accounts_insert_own" ON public.user_loyalty_accounts
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "user_loyalty_accounts_update_own" ON public.user_loyalty_accounts
    FOR UPDATE
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "user_loyalty_accounts_delete_own" ON public.user_loyalty_accounts
    FOR DELETE
    USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text));

-- ============================================================
-- 7. AWARD_SEARCH_CACHE (shared cache, no user ownership)
-- ============================================================
ALTER TABLE public.award_search_cache ENABLE ROW LEVEL SECURITY;

-- Read-only access for authenticated users; writes only via service role
CREATE POLICY "award_search_cache_select_authenticated" ON public.award_search_cache
    FOR SELECT
    TO authenticated
    USING (true);

COMMIT;
