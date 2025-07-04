-- Temporarily disable RLS to test if that's causing the 403 error
-- This will help us identify if the issue is with RLS or something else

ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;