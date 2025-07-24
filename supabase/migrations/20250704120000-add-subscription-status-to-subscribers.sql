-- Add subscription_status column to subscribers table
ALTER TABLE public.subscribers
ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('Active', 'Cancelled')); 