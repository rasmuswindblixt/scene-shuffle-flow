-- Re-enable RLS and create proper policies for user access
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can manage all subscription data" ON public.subscribers;

-- Create simple, working policies
CREATE POLICY "Users can manage their own subscription records" 
ON public.subscribers 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id OR auth.email() = email)
WITH CHECK (auth.uid() = user_id OR auth.email() = email);