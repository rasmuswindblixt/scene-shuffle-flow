-- Check if the subscribers table allows the service role to read/write
-- The issue is likely that the RLS policies are too restrictive for the increment-export function

-- Drop the existing restrictive policies and create new ones that work with edge functions
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create new policies that allow both user access and service role access
CREATE POLICY "Users can view their own subscription data" 
ON public.subscribers 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR auth.email() = email
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can insert their own subscription data" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR auth.email() = email
  OR auth.role() = 'service_role'
);

CREATE POLICY "Users can update their own subscription data" 
ON public.subscribers 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR auth.email() = email
  OR auth.role() = 'service_role'
);

-- Allow service role to delete if needed (for admin operations)
CREATE POLICY "Service role can manage all subscription data" 
ON public.subscribers 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');