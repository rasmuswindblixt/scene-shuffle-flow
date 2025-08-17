-- Tighten RLS for subscribers to user_id-only access, backfill, and enforce NOT NULL

-- Ensure RLS is enabled
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can manage their own subscription records" ON public.subscribers;

-- Create granular policies using user_id only
CREATE POLICY "select_own_subscription_by_user_id"
ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "update_own_subscription_by_user_id"
ON public.subscribers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "delete_own_subscription_by_user_id"
ON public.subscribers
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "insert_own_subscription_by_user_id"
ON public.subscribers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Backfill user_id from auth.users based on email (case-insensitive)
UPDATE public.subscribers s
SET user_id = au.id
FROM auth.users au
WHERE s.user_id IS NULL
  AND lower(s.email) = lower(au.email);

-- Add helpful index for queries
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- Enforce presence of user_id after backfill
ALTER TABLE public.subscribers
ALTER COLUMN user_id SET NOT NULL;